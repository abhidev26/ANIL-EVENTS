
"use strict";

/*
  ANIL EVENTS — PREMIUM PWA SERVICE WORKER
  Features:
  - App shell caching
  - Offline fallback
  - Runtime image caching
  - Safe cache versioning
  - Network-first navigation
  - Cache-first local assets
  - Old cache cleanup

  Important:
  Serve this website using HTTPS or localhost.
*/

const CACHE_VERSION = "anil-events-v1.0.0";

const APP_CACHE = `${CACHE_VERSION}-app`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon.svg"
];

const OFFLINE_FALLBACK = "./index.html";

/* Install: cache essential website files */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(async (cache) => {
        const results = await Promise.allSettled(
          APP_SHELL.map((url) => cache.add(url))
        );

        const failed = results
          .map((result, index) => ({ result, url: APP_SHELL[index] }))
          .filter((item) => item.result.status === "rejected");

        if (failed.length) {
          console.warn(
            "Anil Events: some files were not cached:",
            failed.map((item) => item.url)
          );
        }
      })
      .then(() => self.skipWaiting())
  );
});

/* Activate: remove outdated Anil Events caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) =>
              key.startsWith("anil-events-") &&
              ![APP_CACHE, ASSET_CACHE, IMAGE_CACHE].includes(key)
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* Check whether a request belongs to this website's origin */
function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

/* Cache-first strategy for local CSS, JS, icons and manifest */
async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return new Response("This resource is unavailable offline.", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

/* Network-first strategy for pages, falling back to cached HTML */
async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const fallback = await cache.match(OFFLINE_FALLBACK);

    if (fallback) {
      return fallback;
    }

    return new Response(
      "<!doctype html><html lang='en'><meta charset='utf-8'>" +
      "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
      "<title>Anil Events — Offline</title>" +
      "<body style='background:#0b0b0b;color:#d4af63;font-family:Arial,sans-serif;padding:40px'>" +
      "<h1>Anil Events</h1><p>You are offline. Please reconnect and try again.</p>" +
      "</body></html>",
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      }
    );
  }
}

/* Cache-first strategy for images; do not cache failed responses */
async function imageFirst(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok && (response.type === "basic" || response.type === "cors")) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return new Response("", {
      status: 503,
      statusText: "Image unavailable offline"
    });
  }
}

/* Handle website requests */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Do not intercept external websites or third-party services.
  if (!isSameOrigin(url)) {
    return;
  }

  // Page navigation: fresh page when online, cached page offline.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Image requests, including locally hosted gallery photos.
  if (request.destination === "image") {
    event.respondWith(imageFirst(request));
    return;
  }

  // Cache local static resources.
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith("/manifest.json")
  ) {
    event.respondWith(cacheFirst(request));
  }
});

/* Allow the page to request an update check */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
