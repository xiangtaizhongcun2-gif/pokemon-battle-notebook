import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, Party, PokemonBuild } from "./model";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  createId,
  readStoredState,
} from "./storage";

const PENDING_PARTY_SELECTION_KEY = "pokemon-battle-notebook.pending-party-selection.v1";

function copyBuild(build: PokemonBuild): PokemonBuild {
  return {
    ...build,
    id: createId("build"),
    moves: [...build.moves] as PokemonBuild["moves"],
    evs: { ...build.evs },
    ivs: build.ivs ? { ...build.ivs } : undefined,
  };
}

function createCopyName(sourceName: string, parties: Party[]): string {
  const baseName = sourceName.trim() || "名前なし";
  const firstCandidate = `${baseName}のコピー`;
  const existingNames = new Set(parties.map((party) => party.name));

  if (!existingNames.has(firstCandidate)) return firstCandidate;

  let suffix = 2;
  while (existingNames.has(`${firstCandidate} ${suffix}`)) {
    suffix += 1;
  }
  return `${firstCandidate} ${suffix}`;
}

function getActivePartyIndex(): number {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".party-list-item"));
  return buttons.findIndex((button) => button.classList.contains("active"));
}

function writeAppState(state: AppState): void {
  localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent<AppState>(APP_STATE_CHANGED_EVENT, {
      detail: state,
    }),
  );
}

function selectPendingParty(): boolean {
  const pendingPartyId = sessionStorage.getItem(PENDING_PARTY_SELECTION_KEY);
  if (!pendingPartyId) return false;

  const state = readStoredState();
  const partyIndex = state.parties.findIndex((party) => party.id === pendingPartyId);
  const partyButtons = document.querySelectorAll<HTMLButtonElement>(".party-list-item");
  const targetButton = partyIndex >= 0 ? partyButtons[partyIndex] : undefined;

  if (!targetButton) return false;

  sessionStorage.removeItem(PENDING_PARTY_SELECTION_KEY);
  targetButton.click();
  return true;
}

export function PartyCopyAction() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let host: HTMLSpanElement | null = null;

    const attachToPartyEditor = () => {
      if (host !== null && !host.isConnected) {
        host = null;
        setPortalTarget(null);
      }

      const heading = document.querySelector<HTMLElement>(".party-editor > .inline-heading");
      const deleteButton = heading?.querySelector<HTMLButtonElement>(".danger-text-button");

      if (heading && deleteButton && host === null) {
        host = document.createElement("span");
        host.className = "party-copy-host";
        host.style.display = "contents";
        heading.insertBefore(host, deleteButton);
        setPortalTarget(host);
      }

      if ((!heading || !deleteButton) && host !== null) {
        host.remove();
        host = null;
        setPortalTarget(null);
      }

      selectPendingParty();
    };

    attachToPartyEditor();
    const observer = new MutationObserver(attachToPartyEditor);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      host?.remove();
    };
  }, []);

  const copySelectedParty = () => {
    const state = readStoredState();
    const activePartyIndex = getActivePartyIndex();
    const sourceParty = activePartyIndex >= 0 ? state.parties[activePartyIndex] : undefined;

    if (!sourceParty) {
      window.alert("複製するパーティを選択してください。");
      return;
    }

    const copiedParty: Party = {
      ...sourceParty,
      id: createId("party"),
      name: createCopyName(sourceParty.name, state.parties),
      members: sourceParty.members.map(copyBuild),
    };
    const nextState: AppState = {
      ...state,
      parties: [...state.parties, copiedParty],
    };

    try {
      writeAppState(nextState);
      sessionStorage.setItem(PENDING_PARTY_SELECTION_KEY, copiedParty.id);
      window.location.reload();
    } catch {
      window.alert("パーティを複製できませんでした。ブラウザの保存容量を確認してください。");
    }
  };

  if (!portalTarget) return null;

  return createPortal(
    <button
      className="text-button"
      type="button"
      onClick={copySelectedParty}
      title="選択中のパーティを複製"
    >
      複製
    </button>,
    portalTarget,
  );
}
