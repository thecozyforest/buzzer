const CACHE = 'buzzer-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/index.html', '/manifest.json']))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// 화면 꺼진 상태에서 Ably 메시지를 받아 시스템 알림 띄우기
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'BUZZ') {
    const { title, body, icon } = e.data;
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      tag: 'buzz',
      renotify: true,
      actions: [{ action: 'open', title: '앱 열기' }]
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// 주기적 백그라운드 동기화 (지원되는 브라우저에서)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'buzz-check') {
    e.waitUntil(Promise.resolve());
  }
});
