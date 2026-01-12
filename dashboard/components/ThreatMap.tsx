
'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  Sphere,
  Graticule
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Attack } from '@/lib/mockData';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Manual mapping for the world-atlas topology which lacks ISO_A2
const NAME_TO_CODE: { [key: string]: string } = {
    "United States of America": "US",
    "China": "CN",
    "Russia": "RU", 
    "Brazil": "BR",
    "Germany": "DE",
    "United Kingdom": "GB",
    "India": "IN",
    "Japan": "JP",
    "France": "FR",
    "Canada": "CA",
    "Australia": "AU",
    "South Africa": "ZA",
    "Turkey": "TR",
    "Italy": "IT",
    "Spain": "ES",
    "Ukraine": "UA",
    "Poland": "PL",
    "Romania": "RO",
    "Indonesia": "ID",
    "Mexico": "MX",
    "Saudi Arabia": "SA",
    "Egypt": "EG",
    "Iran": "IR",
    "Pakistan": "PK",
    "Argentina": "AR",
    "South Korea": "KR",
    "North Korea": "KP"
};


interface ThreatMapProps {
  attacks: Attack[];
  highlightData?: { [countryCode: string]: number }; // Code -> Count mapping
  onCountryClick?: (geo: any) => void;
}

const ThreatMap: React.FC<ThreatMapProps> = ({ attacks, highlightData, onCountryClick }) => {
  // Pre-calculate stats map to avoid O(N*M) in render loop
  const countryStats = React.useMemo(() => {
    const stats: Record<string, { incoming: number; outgoing: number }> = {};
    attacks.forEach(a => {
        // Incoming
        if (a.targetCountryCode) {
            if (!stats[a.targetCountryCode]) stats[a.targetCountryCode] = { incoming: 0, outgoing: 0 };
            stats[a.targetCountryCode].incoming++;
        }
        // Outgoing
        if (a.sourceCountryCode) {
            if (!stats[a.sourceCountryCode]) stats[a.sourceCountryCode] = { incoming: 0, outgoing: 0 };
            stats[a.sourceCountryCode].outgoing++;
        }
    });
    return stats;
  }, [attacks]);

  // Globe Rotation State
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState(400); // Increased initial size from 250
  
  // Auto-rotate if idle - OPTIMIZED with requestAnimationFrame
  const autoRotateRef = useRef<number>(0);
  const lastTime = useRef<number>(0);
  
  useEffect(() => {
     let animationFrameId: number;
     
     const animate = (time: number) => {
         // Cap frame rate for rotation to ~30fps to save CPU for React rendering
         if (time - lastTime.current > 32) { // ~30ms
             if (!isDragging.current) {
                setRotation(r => [r[0] + 0.15, r[1], r[2]]);
             }
             lastTime.current = time;
         }
         animationFrameId = requestAnimationFrame(animate);
     };
     
     animationFrameId = requestAnimationFrame(animate);
     return () => cancelAnimationFrame(animationFrameId);
  }, []);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Hover State - Convert to Ref to completely bypass React render cycle for Hover
  // const [hoveredCountry, setHoveredCountry] = useState<{ name: string; incoming: number; outgoing: number } | null>(null);
  const hoveredCountryRef = useRef<{ name: string; incoming: number; outgoing: number } | null>(null);

  // Mouse Interaction for Globe Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
        // Hide tooltip immediately when dragging starts to prevent flickering
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Direct DOM manipulation for tooltip performance (zero React re-renders)
    if (tooltipRef.current) {
        tooltipRef.current.style.left = `${e.clientX + 15}px`;
        tooltipRef.current.style.top = `${e.clientY + 15}px`;
    }

    if (!isDragging.current) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    setRotation((prev) => [
      prev[0] + dx / 3, // Rotate longitude (yaw)
      prev[1] - dy / 3, // Rotate latitude (pitch)
      prev[2],
    ]);

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
  };
  
  // Wheel Interaction for Zoom
  const handleWheel = (e: React.WheelEvent) => {
      // Normalize wheel delta
      const ZOOM_SPEED = 0.5;
      const newScale = scale - (e.deltaY * ZOOM_SPEED);
      // Clamp values (Min 100, Max 8000 for deep zoom)
      setScale(Math.max(100, Math.min(newScale, 2000)));
  };


  // Color scale helper could be added here, but simple linear step for now
  const getContentColor = (code: string) => {
    if (!highlightData) return "#0F172A"; // Default dark blue
    const count = highlightData[code] || 0;
    if (count > 1000) return "#7f1d1d"; // Dark red
    if (count > 500) return "#991b1b";
    if (count > 100) return "#b91c1c";
    if (count > 10) return "#ef4444";
    if (count > 0) return "#f87171";
    return "#1e293b"; // Gray for 0
  };

  return (
    <div 
      className="w-full h-full bg-[#050B14] relative overflow-hidden rounded-lg border border-gray-800 cursor-move"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{
          rotate: rotation,
          scale: scale
        }}
        className="w-full h-full"
      >
        <Sphere stroke="#1E293B" strokeWidth={1} fill="#050B14" id="rsm-sphere" />
        <Graticule stroke="#1E293B" strokeWidth={0.5} />
        
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
                const geoName = geo.properties.name || geo.properties.NAME || "Unknown";
                const countryCode = geo.properties.ISO_A2 || NAME_TO_CODE[geoName] || "XX";
                const fillColor = highlightData ? getContentColor(countryCode) : "#0F172A";
                
                // Optimized Hover Handler - Direct DOM manipulation
                const handleEnter = () => {
                     // Do not show tooltip if dragging/rotating
                     if (isDragging.current) return;

                     const stats = countryStats[countryCode] || { incoming: 0, outgoing: 0 };
                     hoveredCountryRef.current = { name: geoName, incoming: stats.incoming, outgoing: stats.outgoing };

                     if (tooltipRef.current) {
                        const t = tooltipRef.current;
                        t.style.opacity = '1';
                        // Update content manually
                        t.querySelector('.t-name')!.textContent = geoName;
                        t.querySelector('.t-inc')!.textContent = stats.incoming.toString();
                        t.querySelector('.t-out')!.textContent = stats.outgoing.toString();
                     }
                };

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#1E293B"
                    strokeWidth={0.5}
                    onClick={() => onCountryClick && onCountryClick(geo.properties)}
                    onMouseEnter={handleEnter}
                    onMouseLeave={() => {
                        hoveredCountryRef.current = null;
                        if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
                    }}
                    style={{
                      default: { outline: "none", transition: "fill 200ms" }, // Removed 'all' transition to stop transform thrashing
                      hover: { fill: "#3b82f6", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
            })
          }
        </Geographies>


        <AnimatePresence>
          {attacks.map((attack) => (
             <Attackline key={attack.id} attack={attack} />
          ))}
        </AnimatePresence>
      </ComposableMap>
      
      {/* Tooltip with ref-based positioning AND content */}
      <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: 0, 
            top: 0,
            opacity: 0, // Hidden by default
            zIndex: 9999,
            pointerEvents: 'none',
            transition: 'opacity 0.1s ease-out'
          }}
          className="bg-slate-900/90 border border-cyan-500/50 p-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-sm min-w-[200px]"
        >
            <h3 className="text-cyan-400 font-bold text-lg mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="t-name">Unknown</span>
            </h3>
            <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center text-red-300">
                <span>Incoming Threats:</span>
                <span className="font-mono font-bold text-red-500 t-inc">0</span>
            </div>
            <div className="flex justify-between items-center text-blue-300">
                <span>Originating Attacks:</span>
                <span className="font-mono font-bold text-blue-500 t-out">0</span>
            </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-mono border-t border-slate-700/50 pt-1">
            Realtime Analysis
            </div>
        </div>
    </div>
  );
};

// Animated Attack Line Component - MEMOIZED to prevent recalculation on parent renders if attack hasn't changed
const Attackline = React.memo(({ attack }: { attack: Attack }) => {
    return (
        <React.Fragment>
            {/* The static path (faint) */}
            <Line
                from={attack.sourceCoords}
                to={attack.targetCoords}
                stroke="#3B82F6"
                strokeWidth={0.5}
                strokeOpacity={0.1}
            />
            {/* The moving "missile" - simulated by a duplicate line with dash animation */}
            <Line
                from={attack.sourceCoords}
                to={attack.targetCoords}
                stroke="#67e8f9" 
                strokeWidth={3}
                strokeLinecap="round"
                style={{
                  animation: "attack-flow 2s linear forwards",
                  filter: "drop-shadow(0 0 5px #22d3ee)"
                }}
                className="attack-missile"
                // @ts-ignore - pathLength is a valid SVG attribute but might not be in the types
                pathLength={1} 
            />
            {/* Source Pulse */}
            <Marker coordinates={attack.sourceCoords}>
                <circle r={2} fill="#ef4444" className="animate-ping" />
                <circle r={1} fill="#ef4444" />
            </Marker>
            
            {/* Target Impact Ripple */}
            <Marker coordinates={attack.targetCoords}>
                 <g className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]">
                    <circle r={4} stroke="#f87171" strokeWidth={1} fill="transparent" opacity={0.6} />
                 </g>
                 <circle r={1.5} fill="#ef4444" className="shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </Marker>
        </React.Fragment>
    );
});

export default ThreatMap;
