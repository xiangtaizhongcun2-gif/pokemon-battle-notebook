import { useEffect, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function collectRuntimeUrls(): string[] {
  const urls = new Set<string>([window.location.href]);

  document
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"], link[rel="manifest"], link[rel~="icon"]')
    .forEach((link) => {
      if (link.href) urls.add(link.href);
    });

  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((script) => {
    if (script.src) urls.add(script.src);
  });

  performance.getEntriesByType("resource").forEach((entry) => {
    if (entry.name) urls.add(entry.name);
  });

  return [...urls].filter((value) => {
    try {
      return new URL(value, window.location.href).origin === window.location.origin;
    } catch {
      return false;
    }
  });
}

export function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const reloadForUpdate = useRef(false);

  useEffect(() => {
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const appInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowIosHelp(false);
    };
    const online = () => setOffline(false);
    const offlineListener = () => setOffline(true);

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", appInstalled);
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", appInstalled);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineListener);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let disposed = false;
    let loadHandler: (() => void) | null = null;
    const baseUrl = new URL("./", document.baseURI);
    const serviceWorkerUrl = new URL("sw.js", baseUrl);

    const controllerChange = () => {
      if (reloadForUpdate.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChange);

    void navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: baseUrl.pathname })
      .then((registration) => {
        if (disposed) return registration;

        const showUpdateWhenReady = (worker: ServiceWorker | null) => {
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller &&
              !disposed
            ) {
              setUpdateRegistration(registration);
            }
          });
        };

        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateRegistration(registration);
        }
        showUpdateWhenReady(registration.installing);
        registration.addEventListener("updatefound", () => {
          showUpdateWhenReady(registration.installing);
        });

        return navigator.serviceWorker.ready;
      })
      .then((registration) => {
        if (disposed) return;

        const cacheCurrentApp = () => {
          registration.active?.postMessage({
            type: "CACHE_URLS",
            urls: collectRuntimeUrls(),
          });
        };

        if (document.readyState === "complete") {
          cacheCurrentApp();
        } else {
          loadHandler = cacheCurrentApp;
          window.addEventListener("load", loadHandler, { once: true });
        }
      })
      .catch((error: unknown) => {
        console.warn("Service Workerの登録に失敗しました。", error);
      });

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChange);
      if (loadHandler) window.removeEventListener("load", loadHandler);
    };
  }, []);

  const requestInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
      return;
    }

    if (isIos()) setShowIosHelp(true);
  };

  const applyUpdate = () => {
    const waiting = updateRegistration?.waiting;
    if (!waiting) return;
    reloadForUpdate.current = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  const canInstall = !installed && (Boolean(installPrompt) || isIos());

  return (
    <>
      {canInstall && (
        <button className="pwa-install-button" type="button" onClick={() => void requestInstall()}>
          <span aria-hidden="true">＋</span>
          アプリをインストール
        </button>
      )}

      {offline && (
        <div className="pwa-offline-badge" role="status">
          オフライン
        </div>
      )}

      {updateRegistration && (
        <div className="pwa-update-toast" role="status">
          <div>
            <strong>新しいバージョンがあります</strong>
            <span>更新して最新の機能を利用できます。</span>
          </div>
          <button type="button" onClick={applyUpdate}>更新</button>
          <button
            className="pwa-toast-close"
            type="button"
            aria-label="更新通知を閉じる"
            onClick={() => setUpdateRegistration(null)}
          >
            ×
          </button>
        </div>
      )}

      {showIosHelp && (
        <div className="pwa-dialog-backdrop" role="presentation" onMouseDown={() => setShowIosHelp(false)}>
          <section
            className="pwa-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-ios-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pwa-dialog-heading">
              <div>
                <p className="eyebrow">INSTALL</p>
                <h2 id="pwa-ios-title">ホーム画面に追加</h2>
              </div>
              <button type="button" aria-label="閉じる" onClick={() => setShowIosHelp(false)}>×</button>
            </div>
            <ol>
              <li>Safari下部の「共有」ボタンを押します。</li>
              <li>メニューから「ホーム画面に追加」を選びます。</li>
              <li>右上の「追加」を押します。</li>
            </ol>
            <p>追加後は通常のアプリと同じようにホーム画面から起動できます。</p>
            <button className="primary-button" type="button" onClick={() => setShowIosHelp(false)}>
              閉じる
            </button>
          </section>
        </div>
      )}
    </>
  );
}
