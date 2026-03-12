import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, useTexture, Html } from "@react-three/drei";
import { useRef, Suspense, useState } from "react";
import * as THREE from "three";
import "./App.css";
import { epochSlices } from "./data/mockEvents";
import type { HistoricalEvent } from "./data/mockEvents";

function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

function Marker({ event, onClick }: { event: HistoricalEvent; onClick: () => void }) {
  const position = latLongToVector3(event.lat, event.lng, 2);
  return (
    <mesh position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color="#ff4081" />
      <Html distanceFactor={15}>
        <div 
          className="marker-label" 
          style={{ 
            color: 'white', 
            background: 'rgba(0,0,0,0.7)', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            pointerEvents: 'auto',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            transform: 'translate3d(-50%, -150%, 0)',
            border: '1px solid rgba(255,255,255,0.2)'
          }} 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {event.title}
        </div>
      </Html>
    </mesh>
  );
}

function Earth({ events, onSelectEvent }: { events: HistoricalEvent[], onSelectEvent: (e: HistoricalEvent) => void }) {
  const earthRef = useRef<THREE.Group>(null);
  const [colorMap] = useTexture(['https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg']);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={earthRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={colorMap} roughness={0.6} metalness={0.1} />
      </mesh>
      {events.map(event => (
        <Marker key={event.id} event={event} onClick={() => onSelectEvent(event)} />
      ))}
    </group>
  );
}

function App() {
  const [selectedYear, setSelectedYear] = useState<number>(epochSlices[0].year);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [flash, setFlash] = useState(false);

  const currentSlice = epochSlices.find(s => s.year === selectedYear) || epochSlices[0];

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    setSelectedEvent(null);
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  };

  return (
    <div className="app-container">
      {flash && <div className="flash-overlay" style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', pointerEvents: 'none',
        zIndex: 100, transition: 'background-color 0.5s', opacity: flash ? 1 : 0
      }} />}
      
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <Stars radius={100} depth={50} count={flash ? 10000 : 5000} factor={4} saturation={0} fade speed={flash ? 3 : 1} />
          <Suspense fallback={null}>
            <Earth events={currentSlice.events} onSelectEvent={setSelectedEvent} />
          </Suspense>
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <div className="sidebar glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="theme-summary">
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
              {currentSlice.year > 0 ? `公元 ${currentSlice.year} 年` : `公元前 ${Math.abs(currentSlice.year)} 年`}
            </h2>
            <p style={{ fontStyle: 'italic', color: '#ffb300', margin: 0 }}>上帝视角：{currentSlice.themeSummary}</p>
          </div>

          <div className="events-list" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>同时代事件</h3>
            <ul className="info-list" style={{ listStyle: 'none', padding: 0 }}>
              {currentSlice.events.map(ev => (
                <li 
                  key={ev.id} 
                  onClick={() => setSelectedEvent(ev)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '4px',
                    marginBottom: '8px',
                    backgroundColor: selectedEvent?.id === ev.id ? 'rgba(255,255,255,0.2)' : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{ev.title}</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>{ev.region}</div>
                </li>
              ))}
            </ul>
          </div>

          {selectedEvent && (
            <div className="event-details" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#61dafb' }}>{selectedEvent.title}</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{selectedEvent.description}</p>
            </div>
          )}
        </div>

        <div className="timeline-container glass-panel">
          <div className="timeline-labels" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 20px' }}>
            {epochSlices.map((slice) => (
              <div 
                key={slice.year}
                onClick={() => handleYearClick(slice.year)}
                style={{
                  cursor: 'pointer',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  backgroundColor: slice.year === selectedYear ? 'rgba(97, 218, 251, 0.3)' : 'transparent',
                  border: slice.year === selectedYear ? '1px solid #61dafb' : '1px solid transparent',
                  transition: 'all 0.3s'
                }}
              >
                {slice.year > 0 ? `公元 ${slice.year}` : `公元前 ${Math.abs(slice.year)}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
