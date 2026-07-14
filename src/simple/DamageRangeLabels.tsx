import { useEffect } from "react";

const RANGE_PATTERN = /^(-?\d+(?:\.\d+)?)\s*[〜~～-]\s*(-?\d+(?:\.\d+)?)$/;
const PERCENT_RANGE_PATTERN = /^(-?\d+(?:\.\d+)?)%\s*[〜~～-]\s*(-?\d+(?:\.\d+)?)%$/;

function formatRangeLabels(): void {
  const summary = document.querySelector<HTMLElement>(
    ".damage-calculator-page .damage-result-summary",
  );
  if (!summary) return;

  const damageValue = summary.querySelector<HTMLElement>(":scope > div:nth-child(1) strong");
  const percentValue = summary.querySelector<HTMLElement>(":scope > div:nth-child(2) strong");

  if (damageValue) {
    const rawDamage = damageValue.textContent?.trim() ?? "";
    const match = rawDamage.match(RANGE_PATTERN);
    if (match) {
      damageValue.textContent = `最小値 ${match[1]} ～ 最大値 ${match[2]}`;
      damageValue.setAttribute("aria-label", `最小ダメージ${match[1]}、最大ダメージ${match[2]}`);
    }
  }

  if (percentValue) {
    const rawPercent = percentValue.textContent?.trim() ?? "";
    const match = rawPercent.match(PERCENT_RANGE_PATTERN);
    if (match) {
      percentValue.textContent = `最小 ${match[1]}% ～ 最大 ${match[2]}%`;
      percentValue.setAttribute(
        "aria-label",
        `最小HP割合${match[1]}パーセント、最大HP割合${match[2]}パーセント`,
      );
    }
  }
}

export function DamageRangeLabels() {
  useEffect(() => {
    let scheduled = false;
    const refresh = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        formatRangeLabels();
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
