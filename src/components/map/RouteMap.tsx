'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface Place {
  id: string;
  name: string;
  type: string;
  lat: number;
  long: number;
  description?: string;
  tags?: string[];
}

interface RouteMapProps {
  places: Place[];
  route?: string[];
}

export default function RouteMap({ places, route = [] }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [stats, setStats] = useState({ total: 0, visible: 0 });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Pune
    const map = L.map(mapContainerRef.current, {
      center: [18.5204, 73.8567],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
      preferCanvas: true, // Use canvas for better performance
    });

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || places.length === 0) return;

    const map = mapRef.current;

    // Remove existing cluster group
    if (markerClusterGroupRef.current) {
      map.removeLayer(markerClusterGroupRef.current);
    }

    // Clear existing polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Create marker cluster group with custom options
    const markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50, // Cluster markers within 50px
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true, // Load markers in chunks for better performance
      chunkInterval: 200, // Process 200ms chunks
      chunkDelay: 50, // 50ms delay between chunks
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let color = '#3498DB';

        if (count > 100) {
          size = 'large';
          color = '#E74C3C';
        } else if (count > 50) {
          size = 'medium';
          color = '#F39C12';
        }

        return L.divIcon({
          html: `
                        <div style="
                            background: ${color};
                            border: 3px solid white;
                            border-radius: 50%;
                            width: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
                            height: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: ${size === 'large' ? '16px' : size === 'medium' ? '14px' : '12px'};
                            box-shadow: 0 0 20px ${color};
                        ">
                            ${count}
                        </div>
                    `,
          className: 'marker-cluster-custom',
          iconSize: L.point(40, 40),
        });
      },
    });

    // Custom marker icons by type
    const getMarkerIcon = (type: string, isInRoute: boolean) => {
      const emojiMap: Record<string, string> = {
        cafe: '☕', restaurant: '🍽️', park: '🌳', museum: '🏛️',
        temple: '🕉️', fort: '🏰', mall: '🛍️', shopping: '🛒',
        coworking: '💼', hotel: '🏨', bar: '🍺', nightclub: '🎵',
        gym: '💪', spa: '💆', hospital: '🏥', pharmacy: '💊',
        bank: '🏦', atm: '💳', gas_station: '⛽', parking: '🅿️',
        cinema: '🎬', theater: '🎭', library: '📚', school: '🏫',
        university: '🎓', church: '⛪', mosque: '🕌', beach: '🏖️',
        mountain: '⛰️', lake: '🏞️', zoo: '🦁', aquarium: '🐠',
        stadium: '🏟️', default: '📍',
      };

      const colors: Record<string, string> = {
        cafe: '#A0522D', restaurant: '#FF5733', park: '#2ECC71',
        museum: '#9B59B6', temple: '#F1C40F', fort: '#D35400',
        mall: '#3498DB', coworking: '#16A085', default: '#7F8C8D',
      };

      const emoji = emojiMap[type?.toLowerCase() || 'default'] || emojiMap.default;
      const color = colors[type?.toLowerCase() || 'default'] || colors.default;
      const size = isInRoute ? 40 : 32;

      return L.divIcon({
        className: 'custom-marker',
        html: `
                    <div style="
                        width: ${size}px;
                        height: ${size}px;
                        background: ${color};
                        border: 2px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    ">
                        <span style="font-size: ${size * 0.5}px;">${emoji}</span>
                    </div>
                `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // Add markers to cluster group
    const routePlaceIds = new Set(route);
    let validPlaces = 0;

    places.forEach((place) => {
      if (typeof place.lat !== 'number' || typeof place.long !== 'number') {
        return;
      }

      validPlaces++;
      const isInRoute = routePlaceIds.has(place.id);
      const marker = L.marker([place.lat, place.long], {
        icon: getMarkerIcon(place.type, isInRoute),
      });

      // Simplified popup for performance
      const popupContent = `
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #fff;">
                        ${place.name}
                    </h3>
                    <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                        <span style="
                            background: rgba(52, 152, 219, 0.2);
                            border: 1px solid rgba(52, 152, 219, 0.3);
                            color: #5DADE2;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 10px;
                            font-weight: 600;
                        ">${place.type}</span>
                        ${isInRoute ? '<span style="background: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.3); color: #58D68D; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">In Route</span>' : ''}
                    </div>
                    ${place.description ? `<p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.7);">${place.description.substring(0, 80)}...</p>` : ''}
                </div>
            `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup-dark',
      });

      marker.on('click', () => setSelectedPlace(place));
      markerClusterGroup.addLayer(marker);
    });

    // Add cluster group to map
    map.addLayer(markerClusterGroup);
    markerClusterGroupRef.current = markerClusterGroup;

    // Update stats
    setStats({ total: places.length, visible: validPlaces });

    // Draw route polyline if route exists
    if (route.length > 1) {
      const routePlaces = route
        .map(id => places.find(p => p.id === id))
        .filter((p): p is Place => p !== undefined);

      if (routePlaces.length > 1) {
        const routeCoords: [number, number][] = routePlaces.map(p => [p.lat, p.long]);

        L.polyline(routeCoords, {
          color: '#06b6d4',
          weight: 4,
          opacity: 0.8,
          smoothFactor: 1,
        }).addTo(map);

        // Fit bounds to route
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds.pad(0.1));
      }
    } else if (validPlaces > 0) {
      // Fit bounds to all markers
      map.fitBounds(markerClusterGroup.getBounds().pad(0.05));
    }
  }, [places, route]);

  return (
    <div className="relative w-full h-full bg-[#111]">
      <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10" />

      {/* Stats Badge */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg shadow-xl z-[1000]">
        <div className="text-xs text-white/90">
          <span className="font-bold text-cyan-400">{stats.visible.toLocaleString()}</span>
          <span className="text-white/50"> places loaded</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl z-[1000] max-w-xs">
        <h4 className="font-semibold text-xs text-white/90 mb-3 uppercase tracking-wider">Map Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#A0522D] shadow-[0_0_8px_#A0522D]"></div>
            <span className="text-white/70">Cafe</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF5733] shadow-[0_0_8px_#FF5733]"></div>
            <span className="text-white/70">Restaurant</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#2ECC71] shadow-[0_0_8px_#2ECC71]"></div>
            <span className="text-white/70">Park</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]"></div>
            <span className="text-white/70">Planned Route</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
                .custom-marker {
                    transition: transform 0.2s ease;
                }
                .custom-marker:hover {
                    transform: scale(1.1);
                    z-index: 9999 !important;
                }
                
                .marker-cluster-custom {
                    transition: transform 0.2s ease;
                }
                .marker-cluster-custom:hover {
                    transform: scale(1.1);
                }
                
                .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(12px);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                .leaflet-popup-tip {
                    background: rgba(15, 23, 42, 0.95);
                }
                .leaflet-popup-content {
                    margin: 12px;
                    width: auto !important;
                }
                .leaflet-container a.leaflet-popup-close-button {
                    color: rgba(255,255,255,0.5);
                }
                .leaflet-container a.leaflet-popup-close-button:hover {
                    color: white;
                }
                .leaflet-control-attribution {
                    background: rgba(0,0,0,0.5) !important;
                    color: rgba(255,255,255,0.4) !important;
                }
            `}</style>
    </div>
  );
}