import { useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseServices, isFirebaseConfigured } from "./cloudServices";

function isMobileDevice(): boolean {
  return (
    /android|iphone|ipad|ipod/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (code === "auth/popup-blocked") {
    return "Googleログイン画面を開けませんでした。ブラウザのポップアップを許可して、もう一度お試しください。";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Googleログインがキャンセルされました。";
  }
  if (code === "auth/unauthorized-domain") {
    return "この公開URLがFirebaseの認証済みドメインに登録されていません。";
  }
  if (error instanceof Error) return error.message;
  return "Googleログインに失敗しました。";
}

export function MobileCloudAuthFix() {
  useEffect(() => {
    if (!isFirebaseConfigured || !isMobileDevice()) return;

    let signingIn = false;

    const handleClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest<HTMLButtonElement>(
        ".cloud-sync-signed-out .primary-button.full-width",
      );
      if (!button || signingIn) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      signingIn = true;
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Googleログインを開いています…";

      try {
        const services = await getFirebaseServices();
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(services.auth, provider);
      } catch (error) {
        window.alert(authErrorMessage(error));
      } finally {
        signingIn = false;
        if (button.isConnected) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
