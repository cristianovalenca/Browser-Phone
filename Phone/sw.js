const cacheID = "v0";
const CacheItems = [
    "public/vendor/Browser-Phone/Phone/index.html",   // Special page: Loads from network
    "public/vendor/Browser-Phone/Phone/offline.html",   // Special page: Save to cache, but return only when offline

    "public/vendor/Browser-Phone/Phone/favicon.ico",

    "public/vendor/Browser-Phone/Phone/avatars/default.0.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.1.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.2.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.3.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.4.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.5.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.6.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.7.webp",
    "public/vendor/Browser-Phone/Phone/avatars/default.8.webp",

    "public/vendor/Browser-Phone/Phone/wallpaper.dark.webp",
    "public/vendor/Browser-Phone/Phone/wallpaper.light.webp",

    "public/vendor/Browser-Phone/Phone/media/Alert.mp3",
    "public/vendor/Browser-Phone/Phone/media/Ringtone_1.mp3",
    "public/vendor/Browser-Phone/Phone/media/speech_orig.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_Busy-UK.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_Busy-US.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_CallWaiting.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_Congestion-UK.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_Congestion-US.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_EarlyMedia-Australia.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_EarlyMedia-European.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_EarlyMedia-Japan.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_EarlyMedia-UK.mp3",
    "public/vendor/Browser-Phone/Phone/media/Tone_EarlyMedia-US.mp3",

    "public/vendor/Browser-Phone/lib/jquery/jquery-3.6.1.min.js",
    "public/vendor/Browser-Phone/lib/jquery/jquery-ui-1.13.2.min.js",
    "public/vendor/Browser-Phone/lib/jquery/jquery.md5-min.js",
    "public/vendor/Browser-Phone/lib/Chart/Chart.bundle-2.7.2.min.js",
    "public/vendor/Browser-Phone/lib/SipJS/sip-0.20.0.min.js",
    "public/vendor/Browser-Phone/lib/FabricJS/fabric-2.4.6.min.js",
    "public/vendor/Browser-Phone/lib/Moment/moment-with-locales-2.24.0.min.js",
    "public/vendor/Browser-Phone/lib/Croppie/croppie-2.6.4.min.js",
    "public/vendor/Browser-Phone/lib/XMPP/strophe-1.4.1.umd.min.js",

    "public/vendor/Browser-Phone/lib/Normalize/normalize-v8.0.1.css",
    "public/vendor/Browser-Phone/lib/fonts/font_roboto/roboto.css",
    "public/vendor/Browser-Phone/lib/fonts/font_awesome/css/font-awesome.min.css",
    "public/vendor/Browser-Phone/lib/jquery/jquery-ui-1.13.2.min.css",
    "public/vendor/Browser-Phone/lib/Croppie/croppie.css",

    "public/vendor/Browser-Phone/Phone/phone.js",
    "public/vendor/Browser-Phone/Phone/phone.css",
    "public/vendor/Browser-Phone/Phone/phone.light.css",
    "public/vendor/Browser-Phone/Phone/phone.dark.css"

];

self.addEventListener('install', function(event){
    console.log("Service Worker: Install");
    event.waitUntil(caches.open(cacheID).then(function(cache){
        console.log("Cache open, adding Items:", CacheItems);
        return cache.addAll(CacheItems);
    }).then(function(){
        console.log("Items Added to Cache, skipWaiting");
        // Skip waiting to activate
        self.skipWaiting();
    }).catch(function(error){
        console.warn("Error opening Cache:", error);
        // Skip waiting to activate
        self.skipWaiting();
    }));
});

self.addEventListener('activate', function(event){
    console.log("Service Worker: Activate");
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(event){
    if(event.request.url.endsWith("index.html")){
        console.log("Special Home Page handling...", event.request.url);
        event.respondWith(loadHomePage(event.request));
    }
    else {
        // Other Request
        event.respondWith(loadFromCacheFirst(event.request));
    }
});


const loadFromCacheFirst = async function(request) {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        if(responseFromNetwork.ok){
            // If the request was fine, add it to the cache
            addToCache(request, responseFromNetwork.clone());
        }
        return responseFromNetwork;
    }
    catch (error) {
        return new Response("Network Error", { status: 408, statusText : "Network Error", headers: { "Content-Type": "text/plain" },});
    }
}
const loadHomePage = async function(request) {
    // First try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        if(responseFromNetwork.ok){
            // Normal Response from server
            return responseFromNetwork;
        } else {
            throw new Error("Server Error");
        }
    }
    catch (error) {
        const responseFromCache = await caches.match("offline.html");
        if (responseFromCache) {
            return responseFromCache;
        } else {
            return new Response("Network Error", { status: 408, statusText : "Network Error", headers: { "Content-Type": "text/plain" },});
        }
    }
}
const addToCache = async function(request, response) {
    const cache = await caches.open(cacheID);
    await cache.put(request, response);
}
