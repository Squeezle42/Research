/**
 * Service Worker for Gaza War Documentation Website
 * Provides basic caching and offline functionality
 */

const CACHE_NAME = 'gaza-war-docs-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/src/main.js',
    '/src/styles/main.css',
    '/src/modules/utils.js',
    '/src/modules/timeline.js',
    '/src/modules/map.js',
    '/src/modules/news.js',
    '/src/modules/satellite.js',
    '/src/modules/sources.js',
    '/data/timeline.json',
    '/data/locations.json',
    '/data/news_sources.json'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching core files');
                return cache.addAll(CACHE_URLS);
            })
            .catch((error) => {
                console.error('Service Worker: Cache installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }

                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not successful
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed:', error);
                        
                        // Return offline page for HTML requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for offline data updates
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(
            // Perform background sync tasks here
            updateCachedData()
        );
    }
});

// Update cached data
async function updateCachedData() {
    try {
        const cache = await caches.open(CACHE_NAME);
        
        // Update data files
        const dataFiles = [
            '/data/timeline.json',
            '/data/locations.json',
            '/data/news_sources.json'
        ];
        
        for (const file of dataFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    await cache.put(file, response);
                    console.log('Service Worker: Updated cache for', file);
                }
            } catch (error) {
                console.error('Service Worker: Failed to update', file, error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/assets/images/favicon.svg',
            badge: '/assets/images/favicon.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Details',
                    icon: '/assets/images/favicon.svg'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/assets/images/favicon.svg'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('Service Worker: Loaded successfully');
