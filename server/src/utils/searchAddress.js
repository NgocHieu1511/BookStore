const axios = require('axios');

const searchAddress = async (address) => {
    if (!address || address.trim().length < 3) return [];

    try {
        const response = await axios.get('https://photon.komoot.io/api/', {
            params: {
                q: `${address}, Việt Nam`,
                limit: 5,
            },
            timeout: 10000,
        });

        return response.data.features.map((f) => {
            const p = f.properties;
            const description = [
                p.name,
                [p.housenumber, p.street].filter(Boolean).join(' '),
                p.district,
                p.city,
                p.state,
                p.country,
            ]
                .filter(Boolean)
                .join(', ');

            return {
                description,
                place_id: p.osm_id,
                lat: f.geometry.coordinates[1], // Photon trả [lng, lat]
                lng: f.geometry.coordinates[0],
            };
        });
    } catch (error) {
        console.error('Lỗi tìm kiếm địa chỉ:', error.code || error.message);
        return [];
    }
};

module.exports = searchAddress;