// Workspace Jarvis HUD — Service Worker
// Gera cache básico para instalação PWA e uso offline do shell local.
const CACHE_NAME = 'workspace-jarvis-hud-v6-3-performance-sheets';
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  "./google-apps-script.js",
  "./CONFIGURAR-GOOGLE-SHEETS.md",
  "./README.md",
  "./planilha-modelo.csv",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];
const RUNTIME_EXTERNAL_URLS = [
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js",
  "https://cdn.jsdelivr.net/npm/apexcharts",
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    // Dependências de CDN entram em cache sob demanda. Isso deixa a instalação mais rápida.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Não intercepta sincronização com Apps Script: deve sempre tentar rede.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) return;

  // Navegação: network-first com fallback local.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }

  // Arquivos locais e CDNs: cache-first com atualização oportunista.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (err) {
      if (request.destination === 'image') return caches.match('./icons/icon-192.png');
      throw err;
    }
  })());
});
