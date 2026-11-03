import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Custom icons
const donorIcon = L.divIcon({
  className: 'custom-donor-icon',
  html: `<div style="background-color: #166534; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">🍲</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const ngoIcon = L.divIcon({
  className: 'custom-ngo-icon',
  html: `<div style="background-color: #ea580c; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">🏢</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export const RouteMap = ({
  donorLocation,
  ngoLocation,
  routeCoordinates = [],
  donorTitle = 'Surplus Food Donor',
  ngoTitle = 'Partner NGO',
  distanceKm,
  durationMinutes,
  routingType = 'ROAD_OSRM',
}) => {
  // Coordinates in Leaflet format [lat, lon]
  const centerLat = donorLocation ? donorLocation[1] : 12.9716;
  const centerLon = donorLocation ? donorLocation[0] : 77.5946;

  const donorLatLng = donorLocation ? [donorLocation[1], donorLocation[0]] : [12.9716, 77.5946];
  const ngoLatLng = ngoLocation ? [ngoLocation[1], ngoLocation[0]] : null;

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={donorLatLng}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {donorLocation && (
          <Marker position={donorLatLng} icon={donorIcon}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-bold text-forest-800 block text-sm">{donorTitle}</span>
                <span className="text-gray-500">Pickup Origin Bay</span>
              </div>
            </Popup>
          </Marker>
        )}

        {ngoLatLng && (
          <Marker position={ngoLatLng} icon={ngoIcon}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-bold text-orange-700 block text-sm">{ngoTitle}</span>
                <span className="text-gray-500">Recipient Drop-off Center</span>
              </div>
            </Popup>
          </Marker>
        )}

        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#16a34a"
            weight={5}
            opacity={0.85}
            dashArray={routingType === 'ROAD_OSRM' ? null : '8, 8'}
          />
        )}
      </MapContainer>

      {/* Floating Route Badge Overlay */}
      {distanceKm && (
        <div className="absolute top-4 right-4 z-[400] glass-panel px-4 py-3 rounded-xl shadow-md border border-gray-100 flex items-center space-x-3 text-xs">
          <div>
            <div className="font-bold text-gray-800 text-sm">
              {distanceKm} km · {durationMinutes} mins
            </div>
            <div className="text-gray-500 text-[11px] flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${routingType === 'ROAD_OSRM' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {routingType === 'ROAD_OSRM' ? 'Live Road Routing (OSRM)' : 'Estimated Route (Haversine)'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
