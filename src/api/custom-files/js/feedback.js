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

            getRequest.onsuccess = () => resolve(getRequest.result || "");
            getRequest.onerror = () => reject("Failed to fetch locale from IndexedDB");
        };
    });
}

let currentLang = null;

async function updateAppziSetting() {
    let lang = currentLang;
    let user_data = null;
    await getLocaleFromIndexedDB("OpenCRVS", "keyvaluepairs", "language")
        .then((newLang) => {
            if (lang != newLang) {
                lang = ['fr', 'mg'].includes(newLang) ? newLang : 'fr';
            }
        })
        .catch((error) => console.error(error));

    await getLocaleFromIndexedDB("OpenCRVS", "keyvaluepairs", "USER_DETAILS")
        .then((data) => {
            if (data) {
                try {
                    user_data = JSON.parse(data)
                } catch (error) {
                    console.error('Feedback Error: parsing user details data')
                }
            }
        })
        .catch((error) => console.error(error));

    window.appziSettings = {
        data: {
            lang,
            user: user_data?.name?.[0],
            user_mobile: user_data?.mobile,
            username: user_data?.username,
            user_email: user_data?.email,
            user_primary_office: user_data?.primaryOffice?.name,
            system_role: user_data?.systemRole,
        },
        render: {
            type: 'client',
        },
    }
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
