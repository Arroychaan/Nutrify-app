const CACHE_NAME = 'nutrify-v3';
const APP_VERSION = '2.1.0';

const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/chat',
  '/dashboard/meal-plan',
  '/dashboard/profile',
];

// ============================================================================
// Cache Management
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', APP_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Don't skip waiting - let the app control when to update
});

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting, activating new version');
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  clients.claim();
});

// ============================================================================
// Push Notification Handlers
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'Nutrify',
    body: 'Kamu punya notifikasi baru!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'nutrify-notification',
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    tag: data.tag || 'nutrify-notification',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  // Get action if any
  const action = event.action;
  const data = event.notification.data || {};

  // Determine URL based on action
  let url = '/dashboard';
  
  if (action === 'log-food' || data.type === 'meal_reminder') {
    url = '/dashboard/food-log';
  } else if (action === 'view-plan') {
    url = '/dashboard/meal-plan';
  } else if (action === 'view-stats' || data.type === 'weekly_summary') {
    url = '/dashboard';
  } else if (data.type === 'badge_earned') {
    url = '/dashboard/profile';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is open, focus it
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});
