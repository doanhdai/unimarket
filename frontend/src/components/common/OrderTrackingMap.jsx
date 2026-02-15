import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const buyerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const sellerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const OrderTrackingMap = ({ buyerLat, buyerLng, sellerLat, sellerLng, buyerName = 'Người mua', sellerName = 'Cửa hàng', height = 400 }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;
        if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }

        const defaultLat = 10.8231;
        const defaultLng = 106.6297;
        const hasBuyer = buyerLat && buyerLng;
        const hasSeller = sellerLat && sellerLng;

        const centerLat = hasBuyer && hasSeller ? (buyerLat + sellerLat) / 2 : hasBuyer ? buyerLat : hasSeller ? sellerLat : defaultLat;
        const centerLng = hasBuyer && hasSeller ? (buyerLng + sellerLng) / 2 : hasBuyer ? buyerLng : hasSeller ? sellerLng : defaultLng;

        const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        if (hasBuyer) {
            L.marker([buyerLat, buyerLng], { icon: buyerIcon }).addTo(map)
                .bindPopup(`<b>🛒 ${buyerName}</b><br/>Vị trí người mua`).openPopup();
        }
        if (hasSeller) {
            L.marker([sellerLat, sellerLng], { icon: sellerIcon }).addTo(map)
                .bindPopup(`<b>🏪 ${sellerName}</b><br/>Vị trí cửa hàng`);
        }

        if (hasBuyer && hasSeller) {
            const polyline = L.polyline([[buyerLat, buyerLng], [sellerLat, sellerLng]], {
                color: '#667eea', weight: 3, opacity: 0.8, dashArray: '10, 10'
            }).addTo(map);

            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

            const distance = map.distance([buyerLat, buyerLng], [sellerLat, sellerLng]);
            const midLat = (buyerLat + sellerLat) / 2;
            const midLng = (buyerLng + sellerLng) / 2;
            L.popup().setLatLng([midLat, midLng])
                .setContent(`<b>📏 Khoảng cách: ${(distance / 1000).toFixed(1)} km</b>`)
                .openOn(map);
        }

        return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, [buyerLat, buyerLng, sellerLat, sellerLng]);

    if (!buyerLat && !buyerLng && !sellerLat && !sellerLng) {
        return (
            <div style={{ height, background: '#f5f5f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 40, margin: '0 0 8px' }}>📍</p>
                    <p>Chưa có thông tin vị trí</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.1)' }}>
            <div ref={mapRef} style={{ height, width: '100%' }} />
            <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
                <span>🔵 {buyerName} (Người mua)</span>
                <span>🔴 {sellerName} (Cửa hàng)</span>
            </div>
        </div>
    );
};

export default OrderTrackingMap;
