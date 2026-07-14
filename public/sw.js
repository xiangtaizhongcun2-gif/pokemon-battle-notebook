const CACHE_PREFIX = "pokemon-battle-notebook-";
const CACHE_NAME = `${CACHE_PREFIX}app-v1`;
const scopeUrl = new URL(self.registration.scope);
const scopedUrl = (path) => new URL(path, scopeUrl).toString();
const APP_SHELL = [
  scopedUrl("./"),
  scopedUrl("./index.html"),
  scopedUrl("./manifest.webmanifest"),
  scopedUrl("./pwa-icon.svg"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch {
            // A single missing shell file should not block installation.
          }
        }),
      );
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
      self.clients.claim(),
    ]),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match(scopedUrl("./"))) ||
      (await cache.match(scopedUrl("./index.html"))) ||
      Response.error()
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (["script", "style", "image", "font", "manifest"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data?.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const urls = [...new Set(data.urls)]
        .map((value) => {
          try {
            return new URL(value, scopeUrl);
          } catch {
            return null;
          }
        })
        .filter((url) => url && url.origin === self.location.origin && url.href.startsWith(scopeUrl.href));

      await Promise.all(
        urls.map(async (url) => {
          try {
            const request = new Request(url.href, { cache: "reload" });
            const response = await fetch(request);
            if (response.ok) await cache.put(request, response);
          } catch {
            // Runtime caching is best effort.
          }
        }),
      );
    }),
  );
});
