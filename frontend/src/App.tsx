import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, useTexture, Html } from "@react-three/drei";
import { useRef, Suspense, useState } from "react";
import * as THREE from "three";
import "./App.css";
import { mockEvents, HistoricalEvent } from "./data/mockEvents";

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

function Earth({ onSelectEvent }: { onSelectEvent: (e: HistoricalEvent) => void }) {
  const earthRef = useRef<THREE.Group>(null);
  
  // 加载真实的高清地球纹理贴图
  const [colorMap] = useTexture(['https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg']);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001; // 地球自转
    }
  });

  return (
    <group ref={earthRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {mockEvents.map(event => (
        <Marker key={event.id} event={event} onClick={() => onSelectEvent(event)} />
      ))}
    </group>
  );
}

function App() {
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);

  const handleStartExplore = () => {
    alert("欢迎来到时空纪元！历史数据正在加载中，准备开启穿越之旅...");
  };

  return (
    <div className="app-container">
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          <Suspense fallback={null}>
            <Earth onSelectEvent={setSelectedEvent} />
          </Suspense>
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>
      </div>

      {/* Glassmorphism UI Overlay */}
      <div className="ui-overlay">
        {/* Sidebar Info Panel */}
        <div className="sidebar glass-panel">
          {selectedEvent ? (
            <>
              <h2>{selectedEvent.title}</h2>
              <div style={{color: '#61dafb', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold'}}>
                {selectedEvent.year > 0 ? `公元 ${selectedEvent.year} 年` : `公元前 ${Math.abs(selectedEvent.year)} 年`}
              </div>
              <p>{selectedEvent.description}</p>
              <button className="glass-btn" onClick={() => setSelectedEvent(null)}>返回主视图</button>
            </>
          ) : (
            <>
              <h2>时空纪元 (TimeMap)</h2>
              <p>以前所未有的“上帝视角”，探索人类历史的共时性发展。</p>
              <ul className="info-list">
                {mockEvents.map(ev => (
                  <li key={ev.id} onClick={() => setSelectedEvent(ev)}>{ev.title}</li>
                ))}
              </ul>
              <button className="glass-btn" onClick={handleStartExplore}>开始探索</button>
            </>
          )}
        </div>

        {/* Bottom Timeline */}
        <div className="timeline-container glass-panel">
          <div className="timeline-track">
            <div className="timeline-progress"></div>
            <div className="timeline-marker" style={{ left: "20%" }}></div>
            <div className="timeline-marker" style={{ left: "50%" }}></div>
            <div className="timeline-marker" style={{ left: "80%" }}></div>
          </div>
          <div className="timeline-labels">
            <span>过去 (PAST)</span>
            <span>现在 (PRESENT)</span>
            <span>未来 (FUTURE)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
