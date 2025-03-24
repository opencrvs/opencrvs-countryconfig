"use strict";
function getLocaleFromIndexedDB(dbName, storeName, key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => reject("Failed to open IndexedDB");

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(key);

            getRequest.onsuccess = () => resolve(getRequest.result || "en");
            getRequest.onerror = () => reject("Failed to fetch locale from IndexedDB");
        };
    });
}

getLocaleFromIndexedDB("OpenCRVS", "keyvaluepairs", "language")
    .then((locale) => {
        console.warn("getLocaleFromIndexedDB Current Locale:", locale);
        window.appziSettings = {
            data: {
                'lang': ['fr', 'mg'].includes(locale) ? locale : 'fr'
            }
        }
    })
    .catch((error) => console.error(error));

/**
 * Listen for changes to the locale in IndexedDB
 */
window.addEventListener('storagesetitem', (event) => {
    console.warn("storagesetitem :", event?.detail);
    if (event?.detail?.key == 'language') {
        window.appziSettings = {
            data: {
                'lang': ['fr', 'mg'].includes(event?.detail?.value) ? event?.detail?.value : 'fr'
            }
        }
    }
});
