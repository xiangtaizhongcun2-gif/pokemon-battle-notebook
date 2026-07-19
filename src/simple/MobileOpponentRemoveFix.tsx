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
    let handledPointerButton: HTMLButtonElement | null = null;
    let clearHandledTimer: number | null = null;

    const findRemoveButton = (target: EventTarget | null): HTMLButtonElement | null => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLButtonElement>(".opponent-team-chip button");
    };

    const removeOnlySelectedPokemon = (button: HTMLButtonElement) => {
      const chip = button.closest<HTMLElement>(".opponent-team-chip");
      const pokemonName = chip?.querySelector("strong")?.textContent?.trim() ?? "";
      const pokemon = pokedex.find((entry) => normalize(entry.name) === normalize(pokemonName));
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="opponentTeam"]');

      if (!pokemon || !textarea) return;

      const remainingTokens = splitTeamText(textarea.value).filter(
        (token) => !matchesPokemon(pokemon, token),
      );
      writeTextareaValue(textarea, remainingTokens.join("、"));
    };

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

      const button = findRemoveButton(event.target);
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handledPointerButton = button;
      removeOnlySelectedPokemon(button);

      if (clearHandledTimer !== null) window.clearTimeout(clearHandledTimer);
      clearHandledTimer = window.setTimeout(() => {
        handledPointerButton = null;
        clearHandledTimer = null;
      }, 800);
    };

    const handleClick = (event: MouseEvent) => {
      const button = findRemoveButton(event.target);
      if (!button) return;

      const isKeyboardClick = event.detail === 0;
      if (button !== handledPointerButton && !isKeyboardClick) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (isKeyboardClick) removeOnlySelectedPokemon(button);
      handledPointerButton = null;
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
      if (clearHandledTimer !== null) window.clearTimeout(clearHandledTimer);
    };
  }, [pokedex]);

  return null;
}
