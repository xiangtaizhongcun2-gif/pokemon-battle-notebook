import { useEffect } from "react";

function ensureMeta(name: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function ensureLink(rel: string, href: string, type?: string): void {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
  if (type) link.type = type;
}

export function PwaMetadata() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const baseUrl = new URL("./", document.baseURI);
    ensureMeta("theme-color", "#2f6f57");
    ensureMeta("mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-status-bar-style", "default");
    ensureMeta("apple-mobile-web-app-title", "Battle Notebook");
    ensureLink("manifest", new URL("manifest.webmanifest", baseUrl).toString());
    ensureLink("icon", new URL("pwa-icon.svg", baseUrl).toString(), "image/svg+xml");
    ensureLink("apple-touch-icon", new URL("pwa-icon.svg", baseUrl).toString());
  }, []);

  return null;
}
