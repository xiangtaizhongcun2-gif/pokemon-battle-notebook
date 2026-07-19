import { useEffect } from "react";

export function BattleLogResetSync() {
  useEffect(() => {
    let resetTimer: number | null = null;

    const handleReset = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const opponentTeam = form.querySelector<HTMLTextAreaElement>(
        'textarea[name="opponentTeam"]',
      );
      if (!opponentTeam) return;

      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetTimer = null;
        opponentTeam.dispatchEvent(new Event("input", { bubbles: true }));
        opponentTeam.dispatchEvent(new Event("change", { bubbles: true }));
      }, 0);
    };

    document.addEventListener("reset", handleReset, true);
    return () => {
      document.removeEventListener("reset", handleReset, true);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  }, []);

  return null;
}
