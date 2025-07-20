// Service Worker para RPG AI PWA
const CACHE_NAME = 'rpg-ai-v1';
const STATIC_CACHE_NAME = 'rpg-ai-static-v1';

// Recursos para cache
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-96x96.png',
  '/icons/favicon-128x128.png',
];

// Install event - cache recursos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      }),
  );
});

// Activate event - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      }),
  );
});

// Fetch event - estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia: Cache First para recursos estáticos
  if (STATIC_RESOURCES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      }),
    );
    return;
  }

  // Estratégia: Network First para APIs e dados dinâmicos
  if (url.pathname.includes('/api/') || url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone para cache se sucesso
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(request);
        }),
    );
    return;
  }

  // Estratégia: Stale While Revalidate para outros recursos
  event.respondWith(
    caches.match(request).then((response) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });

      return response || fetchPromise;
    }),
  );
});

// Background sync para dados offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'rpg-data-sync') {
    event.waitUntil(
      // Sincronizar dados salvos offline
      syncOfflineData(),
    );
  }
});

// Push notifications (futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do RPG AI',
    icon: '/icons/favicon-96x96.png',
    badge: '/icons/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir RPG AI',
        icon: '/icons/favicon-32x32.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/favicon-32x32.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('RPG AI', options));
});

// Click em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(self.clients.openWindow('/'));
  }
});

// Função auxiliar para sincronização offline
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');

    // Aqui implementaríamos a lógica de sincronização
    // Por exemplo, enviar dados salvos localmente para servidor

    console.log('[SW] Offline data sync complete');
  } catch (error) {
    console.error('[SW] Offline data sync failed:', error);
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
