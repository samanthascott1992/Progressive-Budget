import { response } from "express";

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_to_CACHE = [

    "/",
    "/indexedDB.js",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"

];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_to_CACHE);
        })
    );

 });
self.addEventListener("fetch", event => {

    if(event.request.url.includes("/api/")) {

        event.respondWith(

        caches.open(DATA_CACHE_NAME).then(cache => {

            return fetch (event.request)

            .then(response => {

                if (response.status === 200) {
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
            .catch(err => {
                return cache.match(event.request);
            });

        }).catch(err => {

            console.log(err);

        })

        );

        return;
    }

    event.respondWith(

        fetch(event.request).catch(() => {

            return caches.match(event.request).then(response => {

                if (response) {

                    return response

                } else if (event.request.headers.get("accept").include("text/html")) {

                    return caches.match("/")
                }
            })
            
        })
    )

})