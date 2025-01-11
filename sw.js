const CACHE_NAME = 'shopping-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/scan.html',
    '/style.css',
    '/script.js',
    'https://cdn.jsdelivr.net/npm/@zxing/library@0.18.3/umd/index.min.js'
];

// 安装 Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('正在缓存资源');
            return cache.addAll(urlsToCache);
        })
    );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('清除旧缓存');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
