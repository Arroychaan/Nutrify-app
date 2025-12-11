// Service Worker for Nutrify
const CACHE_NAME = 'nutrify-v4';
const APP_VERSION = '2.2.0';

// Only cache static assets, NOT pages
const urlsToCache = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.svg',
];

// Paths that should NEVER be cached (always fetch from network)
const NEVER_CACHE = [
  '/dashboard',
  '/auth',
  '/api',
  '/_next',
];

// ============================================================================
// Installation - Skip waiting immediately for faster updates
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', APP_VERSION);
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Add files one by one to avoid failing on missing files
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Failed to cache:', url, err);
        }
      }
    }).catch(err => {
      console.warn('[SW] Cache open failed:', err);
    })
  );
});

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting, activating new version');
    self.skipWaiting();
  }
});

// ============================================================================
// Fetch Handler - Network First for HTML, Cache First for assets
// ============================================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Check if this path should never be cached
  const shouldNeverCache = NEVER_CACHE.some(path => url.pathname.startsWith(path));
  
  // For HTML pages and dashboard routes - ALWAYS use network first
  if (event.request.mode === 'navigate' || 
      event.request.headers.get('accept')?.includes('text/html') ||
      shouldNeverCache) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Only fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For static assets - use cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Only cache static assets
        if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      });
    })
  );
});

// ============================================================================
// Activation - Clean up old caches
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', APP_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches that don't match current version
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control immediately
      return clients.claim();
    })
  );
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
    url = '/dashboard/settings/profile';
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
