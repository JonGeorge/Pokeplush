import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isTrusted } from "@/lib/auth/session";
import { getAllPokemonWithStatus } from "@/lib/db/queries";

export const maxDuration = 60;

interface IdentifyRequest {
  description: string;
  priorClues: string[];
}

interface PokemonResult {
  pokedexNumber: number;
  name: string;
  sprite: string;
  types: string[];
  generation: number;
  flavorText: string;
  height: number;
  weight: number;
  evolutionChain: string[];
}

export async function POST(request: NextRequest) {
  console.log("=== Identify endpoint called ===");

  try {
    // Check if device is trusted
    console.log("Step 1: Checking device trust...");
    const trusted = await isTrusted();
    if (!trusted) {
      console.error("Step 1 FAILED: Device not trusted");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Step 1 SUCCESS: Device is trusted");

    // Parse request body
    console.log("Step 2: Parsing request body...");
    let body: IdentifyRequest;
    try {
      body = await request.json();
      console.log("Step 2 SUCCESS: Body parsed:", { description: body.description?.substring(0, 50), priorClues: body.priorClues });
    } catch (e) {
      console.error("Step 2 FAILED: Failed to parse request body:", e);
      throw new Error("Invalid request body");
    }

    const { description, priorClues } = body;

    if (!description || typeof description !== "string") {
      console.error("Step 2 FAILED: Invalid description");
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Get all Pokemon from database
    console.log("Step 3: Fetching Pokemon from database...");
    let allPokemon;
    try {
      allPokemon = await getAllPokemonWithStatus();
      console.log(`Step 3 SUCCESS: Fetched ${allPokemon.length} Pokemon from database`);
    } catch (e) {
      console.error("Step 3 FAILED: Database query failed:", e);
      throw new Error("Failed to fetch Pokemon from database");
    }

    const pokemonList = allPokemon.map(
      (p) => `${p.pokedexNumber}: ${p.name}`
    );

    // Initialize Gemini AI
    console.log("Step 4: Initializing Gemini AI...");
    let genAI, model;
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
      }

      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log("Step 4 SUCCESS: Gemini AI initialized with gemini-2.5-flash");
    } catch (e) {
      console.error("Step 4 FAILED: Failed to initialize Gemini:", e);
      throw e;
    }

    // Build the prompt
    const priorCluesText =
      priorClues.length > 0
        ? `\n\nPreviously mentioned clues: ${priorClues.join(", ")}`
        : "";

    const prompt = `You are a Pokémon identification expert. A user has described a Pokémon and you need to identify it.

User's description: "${description}"${priorCluesText}

Here is the complete list of Pokémon (pokedex number: name):
${pokemonList.join("\n")}

Based on the description, identify the MOST LIKELY Pokémon and 3-5 other possible candidates.

Return ONLY valid JSON in this exact format with NO explanation, NO markdown fences, and NO additional text:
{"bestMatch":123,"candidates":[456,789,101]}

Where the numbers are pokedex numbers. The candidates array should NOT include the bestMatch number.`;

    // Call Gemini API
    console.log("Step 5: Calling Gemini API...");
    let result, responseText;
    try {
      result = await model.generateContent(prompt);
      responseText = result.response.text();
      console.log("Step 5 SUCCESS: Gemini raw response:", responseText);

      // Clean up the response
      responseText = responseText.replace(/```json|```/g, "").trim();
      console.log("Step 5: Cleaned response:", responseText);
    } catch (e) {
      console.error("Step 5 FAILED: Gemini API call failed:", e);
      throw new Error("Failed to call Gemini API");
    }

    // Parse response
    console.log("Step 6: Parsing Gemini response...");
    let parsed: { bestMatch: number; candidates: number[] };
    try {
      parsed = JSON.parse(responseText);
      console.log("Step 6 SUCCESS: Parsed response:", parsed);
    } catch (e) {
      console.error("Step 6 FAILED: Failed to parse Gemini response as JSON");
      console.error("Raw response text:", responseText);
      console.error("Parse error:", e);
      throw new Error(`Failed to parse AI response: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Fetch detailed information for each Pokemon
    const fetchPokemonDetails = async (
      pokedexNumber: number
    ): Promise<PokemonResult | null> => {
      try {
        console.log(`  Fetching details for Pokemon #${pokedexNumber}...`);

        // Fetch species data
        const speciesRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${pokedexNumber}`
        );
        if (!speciesRes.ok) {
          console.error(`  Failed to fetch species for #${pokedexNumber}: ${speciesRes.status} ${speciesRes.statusText}`);
          return null;
        }
        const speciesData = await speciesRes.json();

        // Fetch pokemon data
        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`
        );
        if (!pokemonRes.ok) {
          console.error(`  Failed to fetch pokemon data for #${pokedexNumber}: ${pokemonRes.status} ${pokemonRes.statusText}`);
          return null;
        }
        const pokemonData = await pokemonRes.json();
        console.log(`  Successfully fetched ${pokemonData.name}`);


        // Extract flavor text (first English entry)
        const flavorTextEntry = speciesData.flavor_text_entries.find(
          (entry: { language: { name: string } }) =>
            entry.language.name === "en"
        );
        const flavorText = flavorTextEntry
          ? flavorTextEntry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ")
          : "No description available.";

        // Extract generation number from URL
        const generationUrl = speciesData.generation.url;
        const generationMatch = generationUrl.match(/\/generation\/(\d+)\//);
        const generation = generationMatch
          ? parseInt(generationMatch[1], 10)
          : 1;

        // Extract types
        const types = pokemonData.types.map(
          (t: { type: { name: string } }) => t.type.name
        );

        // Sprite URL (official artwork)
        const sprite =
          pokemonData.sprites.other["official-artwork"].front_default ||
          pokemonData.sprites.front_default;

        // Fetch evolution chain
        let evolutionChain: string[] = [];
        try {
          const evolutionChainRes = await fetch(
            speciesData.evolution_chain.url
          );
          if (evolutionChainRes.ok) {
            const evolutionData = await evolutionChainRes.json();
            evolutionChain = parseEvolutionChain(evolutionData.chain);
          } else {
            console.error(`  Failed to fetch evolution chain for #${pokedexNumber}: ${evolutionChainRes.status}`);
          }
        } catch (e) {
          console.error(`  Evolution chain fetch error for #${pokedexNumber}:`, e);
        }

        return {
          pokedexNumber,
          name: pokemonData.name,
          sprite,
          types,
          generation,
          flavorText,
          height: pokemonData.height, // in decimetres
          weight: pokemonData.weight, // in hectograms
          evolutionChain,
        };
      } catch (error) {
        console.error(`  FAILED to fetch details for Pokemon #${pokedexNumber}:`);
        console.error(`  Error:`, error);
        return null;
      }
    };

    // Parse evolution chain recursively
    const parseEvolutionChain = (chain: any): string[] => {
      const names: string[] = [];

      const traverse = (node: any) => {
        if (node.species) {
          names.push(
            node.species.name.charAt(0).toUpperCase() +
              node.species.name.slice(1)
          );
        }
        if (node.evolves_to && node.evolves_to.length > 0) {
          // Take the first evolution path
          traverse(node.evolves_to[0]);
        }
      };

      traverse(chain);
      return names;
    };

    // Fetch details for best match and candidates
    console.log("Step 7: Fetching Pokemon details from PokéAPI...");
    console.log(`Fetching details for bestMatch: ${parsed.bestMatch}, candidates: ${parsed.candidates.join(", ")}`);

    let bestMatch, candidateResults;
    try {
      [bestMatch, ...candidateResults] = await Promise.all([
        fetchPokemonDetails(parsed.bestMatch),
        ...parsed.candidates.map((num) => fetchPokemonDetails(num)),
      ]);
      console.log(`Step 7 SUCCESS: Fetched details for ${candidateResults.filter(c => c !== null).length + (bestMatch ? 1 : 0)} Pokemon`);
    } catch (e) {
      console.error("Step 7 FAILED: PokéAPI fetch failed:", e);
      throw new Error("Failed to fetch Pokemon details from PokéAPI");
    }

    if (!bestMatch) {
      console.error("Step 7 FAILED: Best match returned null");
      throw new Error(`Failed to fetch details for best match Pokemon #${parsed.bestMatch}`);
    }

    // Filter out any null candidates
    const candidates = candidateResults.filter(
      (c): c is PokemonResult => c !== null
    );

    console.log("Step 8: Returning successful response");
    console.log(`Best match: ${bestMatch.name}, Candidates: ${candidates.map(c => c.name).join(", ")}`);

    return NextResponse.json({
      bestMatch,
      candidates,
    });
  } catch (error) {
    console.error("=== FATAL ERROR in identify route ===");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
