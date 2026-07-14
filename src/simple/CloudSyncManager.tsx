import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { AppState } from "./model";
import {
  APP_STATE_CHANGED_EVENT,
  readStoredState,
} from "./storage";
import {
  getFirebaseServices,
  isFirebaseConfigured,
  type FirebaseServices,
} from "./cloudServices";
import {
  applyCloudState,
  downloadPreSyncBackup,
  getDeviceId,
  getLastSyncedHash,
  hashAppState,
  normalizeCloudState,
  serializeAppState,
  setLastSyncedHash,
} from "./cloudSyncState";

type SyncStatus =
  | "disabled"
  | "signed-out"
  | "checking"
  | "choice"
  | "saving"
  | "synced"
  | "offline"
  | "error";

type StatusMessage = {
  kind: SyncStatus;
  text: string;
};

const SYNC_DELAY_MS = 900;

function isMobileDevice(): boolean {
  return (
    /android|iphone|ipad|ipod/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function formatDate(value: number | null): string {
  if (!value) return "まだ同期されていません";
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function summarizeState(state: AppState): string {
  const members = state.parties.reduce(
    (total, party) => total + party.members.length,
    0,
  );
  return `${state.parties.length}パーティ・${members}匹・対戦${state.battleLogs.length}件・型${state.buildTemplates?.length ?? 0}件`;
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "クラウド同期でエラーが発生しました。";
}

export function CloudSyncManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingCloudState, setPendingCloudState] = useState<AppState | null>(null);
  const [status, setStatus] = useState<StatusMessage>({
    kind: isFirebaseConfigured ? "checking" : "disabled",
    text: isFirebaseConfigured
      ? "同期機能を確認しています"
      : "Firebaseの設定が必要です",
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const servicesRef = useRef<FirebaseServices | null>(null);
  const userRef = useRef<User | null>(null);
  const pendingCloudRef = useRef<AppState | null>(null);
  const activeRef = useRef(false);
  const dirtyRef = useRef(false);
  const uploadTimerRef = useRef<number | null>(null);
  const unsubscribeDocumentRef = useRef<Unsubscribe | null>(null);
  const mountedRef = useRef(true);

  const stopDocumentListener = () => {
    unsubscribeDocumentRef.current?.();
    unsubscribeDocumentRef.current = null;
  };

  const clearUploadTimer = () => {
    if (uploadTimerRef.current !== null) {
      window.clearTimeout(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  };

  const setPendingCloud = (state: AppState | null) => {
    pendingCloudRef.current = state;
    setPendingCloudState(state);
  };

  const markStateAsSynced = (uid: string, state: AppState, updatedAt = Date.now()) => {
    const hash = hashAppState(serializeAppState(state));
    setLastSyncedHash(uid, hash);
    dirtyRef.current = false;
    setLastSyncedAt(updatedAt);
    setStatus({ kind: "synced", text: "クラウドと同期済み" });
  };

  const uploadState = async (uid: string, state: AppState) => {
    const services = servicesRef.current;
    if (!services) return;

    dirtyRef.current = true;
    setStatus({
      kind: navigator.onLine ? "saving" : "offline",
      text: navigator.onLine
        ? "クラウドへ保存しています"
        : "オフラインです。再接続後に同期します",
    });

    const serialized = serializeAppState(state);
    await setDoc(doc(services.db, "users", uid, "app", "state"), {
      schemaVersion: 1,
      appState: JSON.parse(serialized) as AppState,
      deviceId: getDeviceId(),
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now(),
    });
    setLastSyncedHash(uid, hashAppState(serialized));
  };

  const scheduleUpload = (state: AppState) => {
    const currentUser = userRef.current;
    if (!currentUser || !activeRef.current || pendingCloudRef.current) return;

    const serialized = serializeAppState(state);
    const hash = hashAppState(serialized);
    if (hash === getLastSyncedHash(currentUser.uid)) return;

    dirtyRef.current = true;
    clearUploadTimer();
    setStatus({
      kind: navigator.onLine ? "saving" : "offline",
      text: navigator.onLine
        ? "変更をクラウドへ保存します"
        : "オフラインです。変更を端末に保存しました",
    });
    uploadTimerRef.current = window.setTimeout(() => {
      uploadTimerRef.current = null;
      void uploadState(currentUser.uid, state).catch((error: unknown) => {
        if (!mountedRef.current) return;
        setStatus({ kind: "error", text: errorText(error) });
      });
    }, SYNC_DELAY_MS);
  };

  const applyRemoteState = (uid: string, state: AppState, updatedAt: number) => {
    const serialized = serializeAppState(state);
    setLastSyncedHash(uid, hashAppState(serialized));
    dirtyRef.current = false;
    applyCloudState(state);
    setLastSyncedAt(updatedAt);
    setStatus({ kind: "synced", text: "別の端末の変更を反映しました" });
  };

  const startDocumentListener = (uid: string) => {
    const services = servicesRef.current;
    if (!services) return;

    stopDocumentListener();
    const stateDocument = doc(services.db, "users", uid, "app", "state");
    unsubscribeDocumentRef.current = onSnapshot(
      stateDocument,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        const remoteState = normalizeCloudState(data.appState);
        if (!remoteState) {
          setStatus({ kind: "error", text: "クラウドデータの形式が正しくありません" });
          return;
        }

        const updatedAt =
          typeof data.updatedAtMs === "number" ? data.updatedAtMs : Date.now();
        const remoteSerialized = serializeAppState(remoteState);
        const localState = readStoredState();
        const localSerialized = serializeAppState(localState);

        if (snapshot.metadata.hasPendingWrites) {
          setStatus({
            kind: navigator.onLine ? "saving" : "offline",
            text: navigator.onLine
              ? "クラウドへ保存しています"
              : "オフラインです。再接続後に同期します",
          });
          return;
        }

        if (remoteSerialized === localSerialized) {
          markStateAsSynced(uid, remoteState, updatedAt);
          return;
        }

        if (dirtyRef.current) {
          scheduleUpload(localState);
          return;
        }

        applyRemoteState(uid, remoteState, updatedAt);
      },
      (error) => {
        setStatus({ kind: "error", text: errorText(error) });
      },
    );
  };

  const initializeUserSync = async (nextUser: User) => {
    const services = servicesRef.current;
    if (!services) return;

    activeRef.current = false;
    setPendingCloud(null);
    setStatus({ kind: "checking", text: "クラウドデータを確認しています" });

    const stateDocument = doc(
      services.db,
      "users",
      nextUser.uid,
      "app",
      "state",
    );
    const snapshot = await getDoc(stateDocument);
    const localState = readStoredState();

    if (!snapshot.exists()) {
      activeRef.current = true;
      await uploadState(nextUser.uid, localState);
      startDocumentListener(nextUser.uid);
      return;
    }

    const remoteState = normalizeCloudState(snapshot.data().appState);
    if (!remoteState) {
      setStatus({ kind: "error", text: "クラウドデータの形式が正しくありません" });
      return;
    }

    const localSerialized = serializeAppState(localState);
    const remoteSerialized = serializeAppState(remoteState);
    const localHash = hashAppState(localSerialized);
    const remoteHash = hashAppState(remoteSerialized);
    const lastHash = getLastSyncedHash(nextUser.uid);

    if (localSerialized === remoteSerialized) {
      activeRef.current = true;
      markStateAsSynced(
        nextUser.uid,
        remoteState,
        typeof snapshot.data().updatedAtMs === "number"
          ? snapshot.data().updatedAtMs
          : Date.now(),
      );
      startDocumentListener(nextUser.uid);
      return;
    }

    if (lastHash === localHash) {
      activeRef.current = true;
      applyRemoteState(
        nextUser.uid,
        remoteState,
        typeof snapshot.data().updatedAtMs === "number"
          ? snapshot.data().updatedAtMs
          : Date.now(),
      );
      startDocumentListener(nextUser.uid);
      return;
    }

    if (lastHash === remoteHash) {
      activeRef.current = true;
      startDocumentListener(nextUser.uid);
      await uploadState(nextUser.uid, localState);
      return;
    }

    setPendingCloud(remoteState);
    setStatus({ kind: "choice", text: "初回同期の方法を選んでください" });
    setIsOpen(true);
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!isFirebaseConfigured) return () => undefined;

    let unsubscribeAuth: Unsubscribe | null = null;

    void getFirebaseServices()
      .then(async (services) => {
        if (!mountedRef.current) return;
        servicesRef.current = services;
        await getRedirectResult(services.auth).catch((error: unknown) => {
          setStatus({ kind: "error", text: errorText(error) });
        });
        unsubscribeAuth = onAuthStateChanged(services.auth, (nextUser) => {
          userRef.current = nextUser;
          setUser(nextUser);
          stopDocumentListener();
          clearUploadTimer();
          dirtyRef.current = false;

          if (!nextUser) {
            activeRef.current = false;
            setPendingCloud(null);
            setStatus({ kind: "signed-out", text: "Googleログインで同期できます" });
            return;
          }

          void initializeUserSync(nextUser).catch((error: unknown) => {
            if (!mountedRef.current) return;
            setStatus({ kind: "error", text: errorText(error) });
          });
        });
      })
      .catch((error: unknown) => {
        if (!mountedRef.current) return;
        setStatus({ kind: "error", text: errorText(error) });
      });

    const handleStateChanged = (event: Event) => {
      const state = (event as CustomEvent<AppState>).detail;
      if (state) scheduleUpload(state);
    };
    const handleOnline = () => {
      if (dirtyRef.current) scheduleUpload(readStoredState());
      else if (userRef.current) {
        setStatus({ kind: "checking", text: "接続を確認しています" });
      }
    };
    const handleOffline = () => {
      if (userRef.current) {
        setStatus({ kind: "offline", text: "オフラインです。端末に保存します" });
      }
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, handleStateChanged);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mountedRef.current = false;
      unsubscribeAuth?.();
      stopDocumentListener();
      clearUploadTimer();
      window.removeEventListener(APP_STATE_CHANGED_EVENT, handleStateChanged);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // Synchronization callbacks intentionally use refs to keep one subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSignIn = async () => {
    const services = servicesRef.current;
    if (!services) return;
    setBusy(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      if (isMobileDevice()) {
        await signInWithRedirect(services.auth, provider);
      } else {
        await signInWithPopup(services.auth, provider);
      }
    } catch (error) {
      setStatus({ kind: "error", text: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleUseLocal = async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    setBusy(true);
    try {
      setPendingCloud(null);
      activeRef.current = true;
      startDocumentListener(currentUser.uid);
      await uploadState(currentUser.uid, readStoredState());
      setIsOpen(false);
    } catch (error) {
      setStatus({ kind: "error", text: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleUseCloud = () => {
    const currentUser = userRef.current;
    const remoteState = pendingCloudRef.current;
    if (!currentUser || !remoteState) return;

    downloadPreSyncBackup(readStoredState());
    applyRemoteState(currentUser.uid, remoteState, Date.now());
    setPendingCloud(null);
    activeRef.current = true;
    startDocumentListener(currentUser.uid);
    setIsOpen(false);
  };

  const handleUploadNow = async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    setBusy(true);
    try {
      activeRef.current = true;
      await uploadState(currentUser.uid, readStoredState());
    } catch (error) {
      setStatus({ kind: "error", text: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleLoadCloud = async () => {
    const services = servicesRef.current;
    const currentUser = userRef.current;
    if (!services || !currentUser) return;
    if (!window.confirm("端末データをバックアップして、クラウドの内容に置き換えますか？")) return;

    setBusy(true);
    try {
      const snapshot = await getDoc(
        doc(services.db, "users", currentUser.uid, "app", "state"),
      );
      const remoteState = snapshot.exists()
        ? normalizeCloudState(snapshot.data().appState)
        : null;
      if (!remoteState) throw new Error("クラウドに読み込めるデータがありません。");
      downloadPreSyncBackup(readStoredState());
      applyRemoteState(currentUser.uid, remoteState, Date.now());
    } catch (error) {
      setStatus({ kind: "error", text: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    const services = servicesRef.current;
    if (!services) return;
    await signOut(services.auth);
    setIsOpen(false);
  };

  const launcherText =
    status.kind === "synced"
      ? "同期済み"
      : status.kind === "saving" || status.kind === "checking"
        ? "同期中"
        : status.kind === "offline"
          ? "オフライン"
          : status.kind === "choice"
            ? "同期を選択"
            : status.kind === "disabled"
              ? "同期設定"
              : "クラウド同期";

  return (
    <>
      <button
        className={`cloud-sync-launcher ${status.kind}`}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`クラウド同期: ${status.text}`}
      >
        <span className="cloud-sync-dot" aria-hidden="true" />
        {launcherText}
      </button>

      {isOpen && (
        <div className="cloud-sync-overlay" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="cloud-sync-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cloud-sync-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cloud-sync-heading">
              <div>
                <p className="eyebrow">CLOUD SYNC</p>
                <h2 id="cloud-sync-title">スマホ・パソコン同期</h2>
              </div>
              <button className="cloud-sync-close" type="button" onClick={() => setIsOpen(false)} aria-label="閉じる">
                ×
              </button>
            </div>

            <div className={`cloud-sync-status ${status.kind}`}>
              <span className="cloud-sync-dot" aria-hidden="true" />
              <div>
                <strong>{status.text}</strong>
                {user && <small>最終同期：{formatDate(lastSyncedAt)}</small>}
              </div>
            </div>

            {!isFirebaseConfigured ? (
              <div className="cloud-sync-setup">
                <p>同期機能を有効にするにはFirebaseプロジェクトの設定が必要です。</p>
                <ol>
                  <li>FirebaseでGoogleログインとFirestoreを有効化</li>
                  <li><code>.env.example</code>を<code>.env.local</code>へコピー</li>
                  <li>FirebaseのWeb設定値を入力して再ビルド</li>
                </ol>
                <p className="cloud-sync-note"><code>docs/firebase-sync-setup.md</code>に詳しい手順があります。</p>
              </div>
            ) : !user ? (
              <div className="cloud-sync-signed-out">
                <p>同じGoogleアカウントでログインすると、パーティ・型テンプレート・対戦履歴を端末間で同期できます。</p>
                <button className="primary-button full-width" type="button" onClick={() => void handleSignIn()} disabled={busy}>
                  Googleでログイン
                </button>
                <p className="cloud-sync-note">ログインしない場合は、現在どおりデータをこの端末だけに保存します。</p>
              </div>
            ) : (
              <div className="cloud-sync-account">
                <div className="cloud-sync-user">
                  <div className="cloud-sync-avatar" aria-hidden="true">
                    {(user.displayName || user.email || "G").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <strong>{user.displayName || "Googleユーザー"}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                {pendingCloudState ? (
                  <div className="cloud-sync-choice">
                    <h3>最初に使うデータを選択</h3>
                    <p>端末とクラウドの両方に異なるデータがあります。選択後は自動同期が始まります。</p>
                    <div className="cloud-sync-choice-card">
                      <strong>この端末のデータ</strong>
                      <span>{summarizeState(readStoredState())}</span>
                      <button className="primary-button" type="button" onClick={() => void handleUseLocal()} disabled={busy}>
                        この端末をクラウドへ保存
                      </button>
                    </div>
                    <div className="cloud-sync-choice-card">
                      <strong>クラウドのデータ</strong>
                      <span>{summarizeState(pendingCloudState)}</span>
                      <button className="secondary-button" type="button" onClick={handleUseCloud} disabled={busy}>
                        クラウドをこの端末へ読み込む
                      </button>
                      <small>読み込み前に現在の端末データをJSONで保存します。</small>
                    </div>
                  </div>
                ) : (
                  <div className="cloud-sync-actions">
                    <button className="primary-button" type="button" onClick={() => void handleUploadNow()} disabled={busy}>
                      この端末を今すぐ保存
                    </button>
                    <button className="secondary-button" type="button" onClick={() => void handleLoadCloud()} disabled={busy}>
                      クラウドから再読み込み
                    </button>
                  </div>
                )}

                <button className="cloud-sync-signout" type="button" onClick={() => void handleSignOut()}>
                  Googleアカウントからログアウト
                </button>
              </div>
            )}

            <p className="cloud-sync-footer-note">同時編集では最後に保存された内容が優先されます。重要な変更前にはデータ管理からバックアップしてください。</p>
          </section>
        </div>
      )}
    </>
  );
}
