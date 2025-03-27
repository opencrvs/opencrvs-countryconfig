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

let currentLang = null;

async function updateAppziSetting() {
    getLocaleFromIndexedDB("OpenCRVS", "keyvaluepairs", "language")
        .then((newLang) => {
            if (currentLang != newLang) {
                currentLang = ['fr', 'mg'].includes(newLang) ? newLang : 'fr';
                window.appziSettings = {
                    data: {
                        'lang': currentLang
                    }
                }
            }
        })
        .catch((error) => console.error(error));
}

if (!currentLang || !window.appziSettings?.data?.lang) {
    updateAppziSetting();
}

/**
 * Listen for changes in IndexedDB
 */
window.addEventListener('storageitemchange', (event) => {
    if (event?.detail?.key == 'language') {
        updateAppziSetting()
    }
});
