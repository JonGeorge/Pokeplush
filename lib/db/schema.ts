import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const pokemon = pgTable("pokemon", {
  pokedexNumber: integer("pokedex_number").primaryKey(),
  name: text("name").notNull(),
  spriteUrl: text("sprite_url").notNull(),
  generation: integer("generation").notNull(),
  types: text("types").array().notNull(),
  cachedAt: timestamp("cached_at", { withTimezone: true }).notNull().defaultNow(),
});

export const collection = pgTable("collection", {
  pokedexNumber: integer("pokedex_number")
    .primaryKey()
    .references(() => pokemon.pokedexNumber),
  status: text("status").notNull().default("none"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
