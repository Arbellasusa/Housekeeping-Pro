const CACHE='hkpro-v3.0.0';
const STATIC=['/','/index.html','/manifest.json',
'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions-compat.js',
'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC.map(u=>new Request(u,{mode:'no-cors'}))).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.hostname.includes('firebaseio.com')||url.pathname.includes('/firestore'))return;
  e.respondWith(caches.match(e.request).then(cached=>{
    const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));}return r;}).catch(()=>cached);
    return cached||net;
  }));
});
