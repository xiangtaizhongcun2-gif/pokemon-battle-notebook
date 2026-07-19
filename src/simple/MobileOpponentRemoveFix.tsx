import { useEffect } from "react";
import type { PokemonEntry } from "./model";
import { usePokedex } from "./pokedex";

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase();
}

function splitTeamText(value: string): string[] {
  return value
    .split(/[、,，\n/／]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function matchesPokemon(pokemon: PokemonEntry, token: string): boolean {
  const normalized = normalize(token);
  return normalize(pokemon.name) === normalized || normalize(pokemon.englishName) === normalized;
}

function writeTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

  if (setter) setter.call(textarea, value);
  else textarea.value = value;

  const inputEvent =
    typeof InputEvent === "function"
      ? new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null })
      : new Event("input", { bubbles: true });

  textarea.dispatchEvent(inputEvent);
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

export function MobileOpponentRemoveFix() {
  const { pokedex } = usePokedex();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest<HTMLButtonElement>(".opponent-team-chip button");
      if (!button) return;

      const chip = button.closest<HTMLElement>(".opponent-team-chip");
      const pokemonName = chip?.querySelector("strong")?.textContent?.trim() ?? "";
      const pokemon = pokedex.find((entry) => normalize(entry.name) === normalize(pokemonName));
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="opponentTeam"]');

      if (!pokemon || !textarea) return;

      const currentTokens = splitTeamText(textarea.value);
      if (currentTokens.length === 0) return;

      const remainingTokens = currentTokens.filter((token) => !matchesPokemon(pokemon, token));
      if (remainingTokens.length === currentTokens.length) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      writeTextareaValue(textarea, remainingTokens.join("、"));
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pokedex]);

  return null;
}
