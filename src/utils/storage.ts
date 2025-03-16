import localforage from 'localforage';

let instance: any;
try {
    instance = localforage.createInstance({
        driver: localforage.INDEXEDDB,
        name: 'multischool_portal_data',
    });
} catch (error) {
    console.log(error);
}

export default instance;
