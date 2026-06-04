// ═══════════════════════════════════════════════════
//  Service Worker — HK Pro Enterprise
//  Hyde House Hotel · Hollywood, FL
// ═══════════════════════════════════════════════════

const CACHE_VERSION   = 'hkpro-v2.1.0';
const STATIC_CACHE    = CACHE_VERSION + '-static';
const DYNAMIC_CACHE   = CACHE_VERSION + '-dynamic';
const MAX_DYNAMIC_ITEMS = 60;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// ── Install ───────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode:'no-cors' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch Strategy ────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Firebase API calls
  if(request.method !== 'GET') return;
  if(url.hostname.includes('firebaseio.com') ||
     url.hostname.includes('googleapis.com') && url.pathname.includes('/firestore')) return;

  // Fonts & static CDN — cache first
  if(url.hostname.includes('fonts.') ||
     url.hostname.includes('gstatic') ||
     url.hostname.includes('cdnjs') ||
     url.hostname.includes('jsdelivr')){
    event.respondWith(cacheFirst(request));
    return;
  }

  // App shell — stale-while-revalidate
  if(url.origin === self.location.origin){
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

async function cacheFirst(request){
  const cached = await caches.match(request);
  if(cached) return cached;
  try {
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch(e){
    return cached || new Response('Offline', { status:503 });
  }
}

async function staleWhileRevalidate(request){
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if(response.ok){
      cache.put(request, response.clone());
      trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
    }
    return response;
  }).catch(() => cached);
  return cached || networkPromise;
}

async function trimCache(cacheName, maxItems){
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  if(keys.length > maxItems){
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

// ── Background Sync ───────────────────────────────
self.addEventListener('sync', event => {
  if(event.tag === 'sync-requests'){
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests(){
  // Sync any queued offline requests
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'sync-complete' });
    });
  } catch(e){}
}

// ── Push Notifications ────────────────────────────
self.addEventListener('push', event => {
  if(!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e){ data.title = event.data.text(); }
  event.waitUntil(
    self.registration.showNotification(data.title || '🏨 HK Pro', {
      body:    data.body    || 'Nueva notificación',
      icon:    '/public/icons/icon-192.png',
      badge:   '/public/icons/icon-72.png',
      vibrate: data.urgent ? [200,100,200,100,200] : [200,100,200],
      tag:     data.tag    || 'hk-notification',
      renotify: true,
      data:    { url: data.url || '/', ...data },
      actions: [
        { action:'view',    title:'Ver detalles' },
        { action:'dismiss', title:'Ignorar'      }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if(event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if(existing){ existing.focus(); existing.navigate(url); return; }
      return clients.openWindow(url);
    })
  );
});

// ── Message from app ──────────────────────────────
self.addEventListener('message', event => {
  if(event.data === 'skipWaiting') self.skipWaiting();
  if(event.data?.type === 'CACHE_URLS'){
    caches.open(STATIC_CACHE).then(cache => cache.addAll(event.data.urls||[]));
  }
});
