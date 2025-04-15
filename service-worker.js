const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

// Instalação do Service Worker e cache de recursos
self.addEventListener('install', event => {
  self.skipWaiting(); // Ativa o SW imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('[ServiceWorker] Cache aberto');
        await Promise.all(
          urlsToCache.map(async url => {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response.clone());
              } else {
                console.warn(`[ServiceWorker] Não foi possível armazenar ${url}`);
              }
            } catch (err) {
              console.warn(`[ServiceWorker] Falha ao buscar ${url}:`, err);
            }
          })
        );
      })
  );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[ServiceWorker] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim()) // Controla todas as páginas imediatamente
  );
});

// Interceptação de requisições e uso do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se o recurso estiver no cache, retorna ele
        if (cachedResponse) {
          return cachedResponse;
        }

        // Caso contrário, tenta buscar na rede
        return fetch(event.request).then(networkResponse => {
          // Verifica se é uma resposta válida
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === 'opaque'
          ) {
            return networkResponse;
          }

          // Clona e armazena no cache
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        }).catch(() => {
          // Se falhar (ex: offline), retorna página offline se for navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
