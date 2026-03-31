'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Registry of Hyderabad Pincodes to Coordinates
const PINCODE_COORDS: Record<string, [number, number]> = {
  '500032': [17.412, 78.432], // Banjara Hills
  '500049': [17.443, 78.348], // Gachibowli
  '500081': [17.462, 78.365], // Kondapur
  '500016': [17.424, 78.454], // Somajiguda
  '500028': [17.439, 78.486], // Secunderabad
  '500072': [17.493, 78.396], // Kukatpally
  '500038': [17.448, 78.374], // Hitech City
  '500034': [17.434, 78.412], // Jubilee Hills
  '500003': [17.444, 78.474], // Begumpet
  '500026': [17.436, 78.444], // Ameerpet
};

function ChangeView({ center, zoom, region }: { center: [number, number], zoom: number, region?: string }) {
  const map = useMap();
  useEffect(() => {
    const coords = region ? PINCODE_COORDS[region] : null;
    if (coords) {
      map.flyTo(coords, 15, { duration: 1.5 });
    } else {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, region, map]);
  return null;
}

interface MapProps {
  data: Array<{
    region: string;
    regionName: string;
    total: number;
    status: 'normal' | 'warning' | 'outbreak';
  }>;
  selectedRegion?: string;
  className?: string;
}

export default function AnalyticsMap({ data, selectedRegion, className = "" }: MapProps) {
  const defaultCenter: [number, number] = [17.44, 78.40]; // Central Hyderabad/Hitech area
  
  return (
    <div className={`relative w-full h-full min-h-[500px] rounded-[40px] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl ${className}`}>
      {/* ── MAP OVERLAY ─────────────────────────────────────────────────── */}
      <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-[32px] shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Geographic Intelligence</p>
          </div>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Active Node: Hyderabad Unified Protocol</p>
        </div>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ChangeView center={defaultCenter} zoom={12} region={selectedRegion} />

        {data.map((item, idx) => {
          const coords = PINCODE_COORDS[item.region];
          if (!coords) return null;

          const color = item.status === 'outbreak' ? '#f43f5e' : item.status === 'warning' ? '#fbbf24' : '#10b981';
          const radius = Math.min(25, 8 + (item.total * 2));

          return (
            <CircleMarker
              key={`${item.region}-${idx}`}
              center={coords}
              pathOptions={{ fillColor: color, color: color, weight: 1, fillOpacity: 0.3 }}
              radius={radius}
            >
              <Popup>
                <div className="p-2 min-w-[120px] font-sans">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{item.region}</p>
                  <p className="text-sm font-bold text-zinc-900">{item.regionName}</p>
                  <div className="w-full h-px bg-zinc-100 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Incidence</span>
                    <span className="text-sm font-black text-zinc-900">{item.total} Cases</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* ── LEGEND ──────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 z-[1000] space-y-2">
        <div className="bg-zinc-900/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-white/80">Outbreak</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-white/80">Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
