import { useId, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";

export function AutocompleteInput({
  ariaLabel,
  value,
  options,
  placeholder,
  onChange,
  onCommit,
  emptyMessage = "一致する候補がありません。",
  maxResults = 12,
}: {
  ariaLabel: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  emptyMessage?: string;
  maxResults?: number;
}) {
  const inputId = useId();
  const listId = `${inputId}-listbox`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const normalized = value.trim().toLocaleLowerCase("ja");
    const candidates = normalized
      ? options.filter((option) => option.toLocaleLowerCase("ja").includes(normalized))
      : options;

    return candidates.slice(0, maxResults);
  }, [maxResults, options, value]);

  const commitValue = (nextValue: string) => {
    const normalized = nextValue.trim();
    if (normalized) onCommit?.(normalized);
  };

  const selectOption = (option: string) => {
    onChange(option);
    commitValue(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = open && activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
      if (option) {
        selectOption(option);
      } else {
        commitValue(value);
        setOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = open && (filteredOptions.length > 0 || Boolean(emptyMessage));

  return (
    <div className="autocomplete-input">
      <input
        id={inputId}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listId : undefined}
        aria-activedescendant={
          showDropdown && activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
        }
        onFocus={() => setOpen(true)}
        onBlur={() => {
          commitValue(value);
          setOpen(false);
          setActiveIndex(-1);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && (
        <div className="autocomplete-menu" id={listId} role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                className={index === activeIndex ? "autocomplete-option active" : "autocomplete-option"}
                id={`${inputId}-option-${index}`}
                key={option}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                {option}
              </button>
            ))
          ) : (
            <p className="autocomplete-empty">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
