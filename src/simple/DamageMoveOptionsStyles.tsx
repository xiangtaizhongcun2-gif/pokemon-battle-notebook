import { useEffect } from "react";
import "../pwa.css";
import { PwaManager } from "./PwaManager";

const styles = `
.damage-move-options-host { min-width: 0; }
.damage-move-options-panel {
  display: grid;
  gap: 14px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--soft);
  padding: 15px;
}
.damage-move-options-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.damage-move-options-heading h3 { margin-bottom: 0; }
.damage-move-option-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  padding: 3px;
}
.damage-move-option-tabs span {
  border-radius: 999px;
  padding: 5px 9px;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.damage-move-option-tabs span.active { background: var(--accent); color: #fff; }
.damage-move-options-status,
.damage-move-options-note {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.55;
}
.damage-move-options-status {
  border-radius: 8px;
  background: #fff;
  padding: 9px 11px;
  color: var(--muted);
}
.damage-move-options-status.ready { background: var(--accent-soft); color: var(--accent); }
.damage-move-options-status.fallback { background: #fff8e8; color: #8a5a00; }
.damage-move-options-note { color: var(--muted); }
@media (max-width: 640px) {
  .damage-move-options-heading { align-items: stretch; flex-direction: column; }
  .damage-move-option-tabs { align-self: flex-start; }
}
`;

const RANGE_PATTERN = /^(\d+(?:\.\d+)?)\s*[〜~～-]\s*(\d+(?:\.\d+)?)$/;
const PERCENT_RANGE_PATTERN = /^(\d+(?:\.\d+)?)%\s*[〜~～-]\s*(\d+(?:\.\d+)?)%$/;

function formatDamageRange(): void {
  const values = document.querySelectorAll<HTMLElement>(
    ".damage-calculator-page .damage-result-summary > div strong",
  );
  const damageValue = values[0];
  const percentValue = values[1];

  const damageMatch = damageValue?.textContent?.trim().match(RANGE_PATTERN);
  if (damageValue && damageMatch) {
    damageValue.textContent = `最小値 ${damageMatch[1]} ～ 最大値 ${damageMatch[2]}`;
  }

  const percentMatch = percentValue?.textContent?.trim().match(PERCENT_RANGE_PATTERN);
  if (percentValue && percentMatch) {
    percentValue.textContent = `最小 ${percentMatch[1]}% ～ 最大 ${percentMatch[2]}%`;
  }
}

export function DamageMoveOptionsStyles() {
  useEffect(() => {
    const refresh = () => window.requestAnimationFrame(formatDamageRange);
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <PwaManager />
    </>
  );
}
