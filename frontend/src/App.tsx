import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture, Html } from "@react-three/drei";
import { useRef, Suspense, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import "./App.css";
import { epochSlices } from "./data/mockEvents";
import type { HistoricalEvent } from "./data/mockEvents";

const MAP_WIDTH = 10;
const MAP_HEIGHT = 5;

function latLongToPlane(lat: number, lng: number): THREE.Vector3 {
  const x = (lng / 180) * (MAP_WIDTH / 2);
  const y = (lat / 90) * (MAP_HEIGHT / 2);
  return new THREE.Vector3(x, y, 0.01);
}

function ButterflyArc({ startPos, endPos }: { startPos: THREE.Vector3; endPos: THREE.Vector3 }) {
  const points = useMemo(() => {
    const mid = startPos.clone().lerp(endPos, 0.5);
    const dist = startPos.distanceTo(endPos);
    const controlPoint = new THREE.Vector3(mid.x, mid.y, dist * 0.3);
    const curve = new THREE.QuadraticBezierCurve3(startPos, controlPoint, endPos);
    return curve.getPoints(50);
  }, [startPos, endPos]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const particleRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.6) % 1;
    if (particleRef.current) {
      const pos = curve.getPointAt(t);
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(points)} />
        <lineBasicMaterial attach="material" color="#00ffff" transparent opacity={0.5} />
      </line>
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color="#00ffff" intensity={2} distance={1} />
      </mesh>
    </group>
  );
}

function ButterflyLines({ selectedEvent }: { selectedEvent: HistoricalEvent | null }) {
  const arcs = useMemo(() => {
    if (!selectedEvent?.relatedEventIds?.length) return [];
    const startPos = latLongToPlane(selectedEvent.lat, selectedEvent.lng);
    const result: { start: THREE.Vector3; end: THREE.Vector3; id: string }[] = [];
    selectedEvent.relatedEventIds.forEach(id => {
      for (const slice of epochSlices) {
        const found = slice.events.find(e => e.id === id);
        if (found) {
          result.push({ start: startPos, end: latLongToPlane(found.lat, found.lng), id });
          break;
        }
      }
    });
    return result;
  }, [selectedEvent]);

  return (
    <group>
      {arcs.map(arc => (
        <ButterflyArc key={arc.id} startPos={arc.start} endPos={arc.end} />
      ))}
    </group>
  );
}

function MarkerPulse({ position }: { position: THREE.Vector3 }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
      ringRef.current.scale.set(s, s, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 - Math.sin(clock.getElapsedTime() * 3) * 0.3;
    }
  });
  return (
    <mesh ref={ringRef} position={[position.x, position.y, 0.005]}>
      <ringGeometry args={[0.06, 0.09, 32]} />
      <meshBasicMaterial color="#ff4081" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Marker({ event, onClick }: { event: HistoricalEvent; onClick: () => void }) {
  const position = latLongToPlane(event.lat, event.lng);
  return (
    <group>
      <mesh position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <circleGeometry args={[0.06, 32]} />
        <meshBasicMaterial color="#ff4081" />
      </mesh>
      <MarkerPulse position={position} />
      <Html position={[position.x, position.y + 0.15, 0.02]} center>
        <div
          style={{
            color: 'rgba(255,255,255,0.9)',
            background: 'rgba(0,0,0,0.6)',
            padding: '2px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(2px)',
            transition: 'all 0.2s ease',
          }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.85)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onPointerOut={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {event.title}
        </div>
      </Html>
    </group>
  );
}

function CameraControls() {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dom = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const ortho = camera as THREE.OrthographicCamera;
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      ortho.zoom = Math.max(40, Math.min(500, ortho.zoom * zoomFactor));
      ortho.updateProjectionMatrix();
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      dom.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const ortho = camera as THREE.OrthographicCamera;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      // 根据 zoom 级别调整平移速度
      const scale = 1 / ortho.zoom;
      camera.position.x -= dx * scale;
      camera.position.y += dy * scale;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      dom.releasePointerCapture(e.pointerId);
    };

    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
    };
  }, [camera, gl]);

  return null;
}

function GraticuleGrid() {
  const lines = useMemo(() => {
    const pts: THREE.Vector3[][] = [];
    const z = 0.002;
    // 经线：每30度一条（-180到180）
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = (lng / 180) * (MAP_WIDTH / 2);
      pts.push([new THREE.Vector3(x, -MAP_HEIGHT / 2, z), new THREE.Vector3(x, MAP_HEIGHT / 2, z)]);
    }
    // 纬线：每30度一条（-90到90）
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = (lat / 90) * (MAP_HEIGHT / 2);
      pts.push([new THREE.Vector3(-MAP_WIDTH / 2, y, z), new THREE.Vector3(MAP_WIDTH / 2, y, z)]);
    }
    return pts;
  }, []);

  return (
    <group>
      {lines.map((pair, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(pair)} />
          <lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.12} />
        </line>
      ))}
      {/* 赤道和本初子午线加粗 */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-MAP_WIDTH / 2, 0, 0.003), new THREE.Vector3(MAP_WIDTH / 2, 0, 0.003)
        ])} />
        <lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -MAP_HEIGHT / 2, 0.003), new THREE.Vector3(0, MAP_HEIGHT / 2, 0.003)
        ])} />
        <lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3} />
      </line>
    </group>
  );
}

function WorldMap({ events, onSelectEvent, selectedEvent }: { events: HistoricalEvent[], onSelectEvent: (e: HistoricalEvent) => void, selectedEvent: HistoricalEvent | null }) {
  const [colorMap] = useTexture(['https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Equirectangular-projection.jpg/1280px-Equirectangular-projection.jpg']);

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT, 1, 1]} />
        <meshStandardMaterial map={colorMap} roughness={0.8} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {/* 经纬线网格 */}
      <GraticuleGrid />
      {/* 地图边框发光 */}
      <lineLoop>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-MAP_WIDTH/2, -MAP_HEIGHT/2, 0.001),
          new THREE.Vector3(MAP_WIDTH/2, -MAP_HEIGHT/2, 0.001),
          new THREE.Vector3(MAP_WIDTH/2, MAP_HEIGHT/2, 0.001),
          new THREE.Vector3(-MAP_WIDTH/2, MAP_HEIGHT/2, 0.001),
        ])} />
        <lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3} />
      </lineLoop>
      {events.map(event => (
        <Marker key={event.id} event={event} onClick={() => onSelectEvent(event)} />
      ))}
      <ButterflyLines selectedEvent={selectedEvent} />
    </group>
  );
}

function App() {
  const [selectedYear, setSelectedYear] = useState<number>(epochSlices[0].year);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [flash, setFlash] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HistoricalEvent[]>([]);

  const currentSlice = epochSlices.find(s => s.year === selectedYear) || epochSlices[0];

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    setSelectedEvent(null);
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const results = epochSlices.flatMap(s => s.events).filter(ev =>
      ev.title.includes(query) || ev.description.includes(query) || ev.region.includes(query)
    );
    setSearchResults(results);
  };

  const handleSelectSearchResult = (ev: HistoricalEvent) => {
    const slice = epochSlices.find(s => s.events.some(e => e.id === ev.id));
    if (slice && slice.year !== selectedYear) {
      setSelectedYear(slice.year);
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
    setSelectedEvent(ev);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="app-container">
      {flash && <div className="flash-overlay" style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', pointerEvents: 'none',
        zIndex: 100, opacity: flash ? 1 : 0
      }} />}

      <div className="canvas-container">
        <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 120, near: 0.1, far: 100 }}>
          <ambientLight intensity={2} />
          <pointLight position={[0, 0, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={flash ? 10000 : 3000} factor={4} saturation={0} fade speed={flash ? 3 : 1} />
          <Suspense fallback={null}>
            <WorldMap events={currentSlice.events} onSelectEvent={setSelectedEvent} selectedEvent={selectedEvent} />
          </Suspense>
          <CameraControls />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <div className="sidebar glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="search-container" style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="全局搜索历史事件（如：罗马、秦）..."
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                background: 'rgba(20, 20, 20, 0.6)', outline: 'none',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            {searchResults.length > 0 && (
              <ul className="search-results glass-panel" style={{
                position: 'absolute', top: '100%', left: 0, width: '100%',
                listStyle: 'none', padding: '10px 0', margin: '10px 0 0 0',
                background: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(10px)',
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                maxHeight: '300px', overflowY: 'auto', zIndex: 1000
              }}>
                {searchResults.map(ev => (
                  <li key={`search-${ev.id}`} onClick={() => handleSelectSearchResult(ev)}
                    style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ color: '#61dafb', fontWeight: 'bold', fontSize: '14px' }}>{ev.title}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{ev.region}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
                <li key={ev.id} onClick={() => setSelectedEvent(ev)}
                  style={{
                    cursor: 'pointer', padding: '8px',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px',
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
              <div key={slice.year} onClick={() => handleYearClick(slice.year)}
                style={{
                  cursor: 'pointer', padding: '5px 15px', borderRadius: '20px',
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
