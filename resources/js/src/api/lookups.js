import api from './client';

let rtoZonesCache = null;
let rtoZonesPromise = null;

export function getRtoZonesCached() {
    if (rtoZonesCache) {
        return Promise.resolve(rtoZonesCache);
    }

    if (!rtoZonesPromise) {
        rtoZonesPromise = api.get('/rtos/zones')
            .then(res => {
                rtoZonesCache = res.data.data || [];
                return rtoZonesCache;
            })
            .finally(() => {
                rtoZonesPromise = null;
            });
    }

    return rtoZonesPromise;
}
