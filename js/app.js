if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(Reg => console.log('Service Worker Registered!', Reg))
        .catch(Err => console.log('Error Registering Service Worker', Err));
}