/**
 * Calculate Great-Circle distance using Haversine formula
 * @param {Array<number>} coord1 [lon, lat]
 * @param {Array<number>} coord2 [lon, lat]
 * @returns {number} Distance in kilometers
 */
export const calculateHaversineDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Fetch road route from OSRM or fallback to simulated road route based on Haversine
 * @param {Array<number>} startCoord [lon, lat]
 * @param {Array<number>} endCoord [lon, lat]
 * @returns {Promise<{distanceKm: number, durationMinutes: number, routingType: string, coordinates: Array<[number, number]>}>}
 */
export const getRoadRoute = async (startCoord, endCoord) => {
  const [startLon, startLat] = startCoord;
  const [endLon, endLat] = endCoord;

  const haversineDist = calculateHaversineDistance(startCoord, endCoord);
  // Urban road factor approximation when OSRM is unavailable
  const estimatedRoadDist = Number((haversineDist * 1.3).toFixed(2));
  // Assume average urban speed 25 km/h -> 2.4 minutes per km + 5 min base pickup handling
  const estimatedDuration = Math.max(5, Math.round(estimatedRoadDist * 2.4 + 5));

  const fallbackResult = {
    distanceKm: estimatedRoadDist,
    durationMinutes: estimatedDuration,
    routingType: 'GEO_HAVERSINE_SIMULATED',
    coordinates: [
      [startLat, startLon],
      [(startLat + endLat) / 2 + 0.002, (startLon + endLon) / 2 - 0.001],
      [endLat, endLon]
    ]
  };

  const osrmBaseUrl = process.env.ROUTING_API_URL || 'https://router.project-osrm.org/route/v1/driving';

  try {
    const url = `${osrmBaseUrl}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast response

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const roadDistanceKm = Number((route.distance / 1000).toFixed(2));
        const roadDurationMinutes = Math.max(3, Math.round(route.duration / 60));

        // Convert [lon, lat] geojson to Leaflet [lat, lon]
        const leafletCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);

        return {
          distanceKm: roadDistanceKm,
          durationMinutes: roadDurationMinutes,
          routingType: 'ROAD_OSRM',
          coordinates: leafletCoords
        };
      }
    }
  } catch (error) {
    // Graceful fallback to transparently labeled simulation
    // (OSRM might be rate-limited, offline, or slow)
  }

  return fallbackResult;
};
