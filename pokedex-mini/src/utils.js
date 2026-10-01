import { SPRITE_BASE_URL } from "./config.js";

export function getIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

// Canonical type colors (PokeAPI palette).
export const TYPE_COLORS = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};

export function getTypeColor(typeName) {
  if (!typeName) return TYPE_COLORS.normal;
  return TYPE_COLORS[typeName.toLowerCase()] || TYPE_COLORS.normal;
}

// PokeAPI stores height/weight in decimetres / hectograms.
export function formatHeight(cmDeci) {
  if (cmDeci == null) return "—";
  return `${(cmDeci / 10).toFixed(1)} m`;
}

export function formatWeight(hectograms) {
  if (hectograms == null) return "—";
  return `${(hectograms / 10).toFixed(1)} kg`;
}

// Turn an evolution-chain tree into levels (BFS) so both linear chains
// (Pichu -> Pikachu -> Raichu) and branching chains (Eevee -> N) render
// as left-to-right stages. Each node: { id, name, url }.
export function parseEvolutionChain(root) {
  const levels = [];
  let current = [root];
  let depth = 0;

  while (current.length > 0) {
    levels.push(
      current.map((node) => ({
        id: getIdFromUrl(node.species.url),
        name: node.species.name,
        url: node.species.url,
      }))
    );

    const next = [];
    for (const node of current) {
      next.push(...(node.evolves_to || []));
    }

    current = next;
    depth += 1;
    if (depth > 12) break; // safety valve; real chains are short
  }

  return levels;
}
