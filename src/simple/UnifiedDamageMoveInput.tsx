import { useEffect } from "react";

function setReactInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function UnifiedDamageMoveInput() {
  useEffect(() => {
    let cleanupCurrent: (() => void) | null = null;

    const attach = () => {
      const panel = document.querySelector<HTMLElement>(".damage-move-options-panel");
      const select = panel?.querySelector<HTMLSelectElement>("select");
      const nativeInput = document.querySelector<HTMLInputElement>(
        ".damage-calculator-page .damage-move-card .damage-move-grid .autocomplete-input input",
      );
      const nativeLabel = nativeInput?.closest("label");
      const selectLabel = select?.closest("label");

      if (!panel || !select || !nativeInput || !nativeLabel || !selectLabel) {
        cleanupCurrent?.();
        cleanupCurrent = null;
        return;
      }

      const existing = panel.querySelector<HTMLElement>(".unified-damage-move-field");
      if (existing) return;

      cleanupCurrent?.();
      selectLabel.classList.add("damage-move-source-hidden");
      nativeLabel.classList.add("damage-move-native-hidden");

      const wrapper = document.createElement("label");
      wrapper.className = "unified-damage-move-field";
      wrapper.textContent = "技";

      const input = document.createElement("input");
      const list = document.createElement("datalist");
      const listId = `damage-move-list-${Math.random().toString(36).slice(2)}`;
      input.setAttribute("list", listId);
      input.setAttribute("autocomplete", "off");
      input.setAttribute("placeholder", "技名を入力または候補から選択");
      input.value = nativeInput.value;
      list.id = listId;

      const syncOptions = () => {
        const values = Array.from(select.options)
          .map((option) => option.value.trim())
          .filter(Boolean);
        list.replaceChildren(
          ...values.map((value) => {
            const option = document.createElement("option");
            option.value = value;
            return option;
          }),
        );
        if (document.activeElement !== input && input.value !== nativeInput.value) {
          input.value = nativeInput.value;
        }
      };

      const handleInput = () => setReactInputValue(nativeInput, input.value);
      input.addEventListener("input", handleInput);
      input.addEventListener("change", handleInput);
      wrapper.append(input, list);
      selectLabel.insertAdjacentElement("afterend", wrapper);
      syncOptions();

      const observer = new MutationObserver(syncOptions);
      observer.observe(select, { childList: true, subtree: true, attributes: true });
      const interval = window.setInterval(syncOptions, 300);

      cleanupCurrent = () => {
        observer.disconnect();
        window.clearInterval(interval);
        input.removeEventListener("input", handleInput);
        input.removeEventListener("change", handleInput);
        wrapper.remove();
        selectLabel.classList.remove("damage-move-source-hidden");
        nativeLabel.classList.remove("damage-move-native-hidden");
      };
    };

    attach();
    const observer = new MutationObserver(() => window.setTimeout(attach, 0));
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
    });
    const interval = window.setInterval(attach, 500);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      cleanupCurrent?.();
    };
  }, []);

  return null;
}
