import { useEffect } from "react";

const MAX_VISIBLE_OPTIONS = 24;

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

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

      const inputWrap = document.createElement("div");
      inputWrap.className = "unified-damage-move-input-wrap";

      const input = document.createElement("input");
      input.type = "search";
      input.setAttribute("autocomplete", "off");
      input.setAttribute("autocapitalize", "none");
      input.setAttribute("spellcheck", "false");
      input.setAttribute("placeholder", "技名を入力または候補から選択");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");
      input.value = nativeInput.value;

      const list = document.createElement("div");
      list.className = "unified-damage-move-list";
      list.setAttribute("role", "listbox");
      list.hidden = true;

      let optionValues: string[] = [];
      let closeTimer: number | null = null;

      const closeList = () => {
        list.hidden = true;
        input.setAttribute("aria-expanded", "false");
      };

      const chooseValue = (value: string) => {
        input.value = value;
        setReactInputValue(nativeInput, value);
        closeList();
        input.focus({ preventScroll: true });
      };

      const renderList = () => {
        const query = normalize(input.value);
        const matches = optionValues
          .filter((value) => !query || normalize(value).includes(query))
          .slice(0, MAX_VISIBLE_OPTIONS);

        list.replaceChildren();
        if (matches.length === 0) {
          const empty = document.createElement("p");
          empty.className = "unified-damage-move-empty";
          empty.textContent = "一致する技がありません";
          list.append(empty);
        } else {
          const fragment = document.createDocumentFragment();
          for (const value of matches) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "unified-damage-move-option";
            button.setAttribute("role", "option");
            button.textContent = value;
            button.addEventListener("pointerdown", (event) => {
              event.preventDefault();
              chooseValue(value);
            });
            fragment.append(button);
          }
          list.append(fragment);
        }

        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
      };

      const syncOptions = () => {
        optionValues = Array.from(select.options)
          .map((option) => option.value.trim())
          .filter(Boolean);
        if (document.activeElement !== input && input.value !== nativeInput.value) {
          input.value = nativeInput.value;
        }
      };

      const handleInput = () => {
        setReactInputValue(nativeInput, input.value);
        renderList();
      };
      const handleFocus = () => {
        if (closeTimer !== null) window.clearTimeout(closeTimer);
        renderList();
      };
      const handleBlur = () => {
        closeTimer = window.setTimeout(closeList, 120);
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") closeList();
        if (event.key === "Enter") {
          const first = list.querySelector<HTMLButtonElement>(".unified-damage-move-option");
          if (first && !list.hidden) {
            event.preventDefault();
            chooseValue(first.textContent ?? "");
          }
        }
      };

      input.addEventListener("input", handleInput);
      input.addEventListener("change", handleInput);
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
      input.addEventListener("keydown", handleKeyDown);
      inputWrap.append(input, list);
      wrapper.append(inputWrap);
      selectLabel.insertAdjacentElement("afterend", wrapper);
      syncOptions();

      const observer = new MutationObserver(() => {
        syncOptions();
        if (document.activeElement === input) renderList();
      });
      observer.observe(select, { childList: true, subtree: true, attributes: true });

      cleanupCurrent = () => {
        observer.disconnect();
        if (closeTimer !== null) window.clearTimeout(closeTimer);
        input.removeEventListener("input", handleInput);
        input.removeEventListener("change", handleInput);
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("keydown", handleKeyDown);
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
