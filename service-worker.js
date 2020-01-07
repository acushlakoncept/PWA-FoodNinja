const staticCacheName = 'static-cache-v4';
const dynamicCacheName = 'dynamic-cache-v4';

const filesToCache = [
    '/',
    'index.html',
    'js/app.js',
    'js/ui.js',
    'js/materialize.min.js',
    'css/style.css',
    'css/materialize.min.css',
    'img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    'pages/404.html',
    'pages/offline.html'
]

// Install service worker
self.addEventListener('install', event => {
    console.log('Service Worker Installed and caching static assets');
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {
            console.log('caching shell assets');
            return cache.addAll(filesToCache);
        })
    )
});

// activate service worker
self.addEventListener('activate', event => {
    console.log('Service Worker Activated');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});


// sw fetch event
// self.addEventListener('fetch', event => {
//     // console.log('Fetch event for ', event.request.url);
//     if (event.request.url.indexOf('firestore.googleapis.com') === -1) {


//         event.respondWith(
//             caches.match(event.request)
//             .then(cacheRes => {
//                 // Found event.request.url in cache
//                 if (cacheRes) {
//                     return cacheRes;
//                 }

//                 // if the caches.match didn't match any in the cache then
//                 return fetch(event.request)
//                     .then(response => {
//                         if (response.status === 404) {
//                             return caches.match('pages/404.html');
//                         }
//                         // but if response.status is not 404
//                         return caches.open(dynamicCacheName)
//                             .then(cache => {
//                                 cache.put(event.request.url, response.clone());
//                                 return response;
//                             })
//                     });
//             }).catch(error => {
//                 console.log('Error', error);
//                 return caches.match('pages/offline.html');
//             })

//         );
//     }
// });


self.addEventListener('fetch', event => {
    // console.log('fetch event', event);
    if (event.request.url.indexOf('firestore.googleapis.com') === -1) {
        event.respondWith(
            caches.match(event.request)
            .then(cacheRes => {
                return cacheRes || fetch(event.request) // if we don't have in the cache then proceed with normal fetch request
                    .then(fetchRes => {
                        return caches.open(dynamicCacheName)
                            .then(cache => {
                                cache.put(event.request.url, fetchRes.clone()); //since we can only use 'fetchRes' once, we clone it and return the original, key, value
                                // limitCacheSize(dynamicCacheName, 3);
                                return fetchRes;
                            })
                    });
            })
            .catch(() => {
                if (event.request.url.indexOf('.html') > -1) {
                    caches.match('/pages/offline.html');
                }
            })
        )
    }
});