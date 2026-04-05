"use client";

import { useState, useEffect, useRef } from "react";
import { PokemonResult } from "./pokemon-result";
import { CandidatesList } from "./candidates-list";

interface PokemonData {
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

interface IdentifyResponse {
  bestMatch: PokemonData;
  candidates: PokemonData[];
}

export function WhosThatView() {
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<IdentifyResponse | null>(null);
  const [featured, setFeatured] = useState<PokemonData | null>(null);
  const [priorClues, setPriorClues] = useState<string[]>([]);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check for Speech Recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setHasSpeechRecognition(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setDescription(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSearch = async () => {
    if (!description.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          priorClues,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to identify Pokémon");
      }

      const data: IdentifyResponse = await response.json();
      setResults(data);
      setFeatured(data.bestMatch);
    } catch (error) {
      console.error("Error identifying Pokémon:", error);
      alert("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Extract keywords from current description
    const stopwords = new Set([
      "it",
      "has",
      "is",
      "a",
      "an",
      "the",
      "and",
      "with",
      "very",
      "that",
      "this",
      "looks",
      "like",
      "kind",
      "of",
      "sort",
    ]);

    const words = description
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopwords.has(word));

    // Combine with existing prior clues (avoid duplicates)
    const newClues = Array.from(new Set([...priorClues, ...words]));
    setPriorClues(newClues);

    // Clear results and refocus input
    setResults(null);
    setFeatured(null);
    setDescription("");

    // Scroll to top and focus input
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-pokered mb-2">
          Who&apos;s That Pokémon?
        </h1>
        <p className="text-slate-600">
          Describe what it looks like and I&apos;ll help you find it!
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Prior Clues Pills */}
        {priorClues.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 mb-2">Already told me:</p>
            <div className="flex flex-wrap gap-2">
              {priorClues.map((clue, index) => (
                <span
                  key={index}
                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                >
                  {clue}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input with Mic Button */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What does it look like?"
            className="w-full min-h-[120px] p-4 pr-14 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-pokeblue text-lg resize-none"
            disabled={isLoading}
          />
          {hasSpeechRecognition && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`absolute right-3 top-3 p-3 rounded-full transition-all ${
                isListening
                  ? "bg-pokered text-white animate-pulse"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title={isListening ? "Listening..." : "Use microphone"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Find It Button */}
        <button
          onClick={handleSearch}
          disabled={!description.trim() || isLoading}
          className="w-full bg-pokered hover:bg-pokered-light text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching...
            </span>
          ) : (
            "Find it!"
          )}
        </button>
      </div>

      {/* Results Section */}
      {results && featured && (
        <div className="space-y-6">
          {/* Featured Result */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              I think it&apos;s...
            </h2>
            <PokemonResult pokemon={featured} />
          </div>

          {/* Candidates */}
          {results.candidates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                Other possibilities:
              </h3>
              <CandidatesList
                candidates={results.candidates}
                featured={featured}
                onSelect={setFeatured}
              />
            </div>
          )}

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            className="w-full border-2 border-dashed border-slate-300 hover:border-pokeblue text-slate-700 font-semibold py-4 rounded-lg transition-colors min-h-[56px]"
          >
            None of these — let me give more details
          </button>
        </div>
      )}
    </div>
  );
}
