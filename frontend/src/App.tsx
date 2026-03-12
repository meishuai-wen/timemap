import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import "./App.css";

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={earthRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#2a4b7c"
        roughness={0.6}
        metalness={0.2}
        wireframe={true}
      />
    </mesh>
  );
}

function App() {
  return (
    <div className="app-container">
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          <Earth />
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>
      </div>

      {/* Glassmorphism UI Overlay */}
      <div className="ui-overlay">
        {/* Sidebar Info Panel */}
        <div className="sidebar glass-panel">
          <h2>时空纪元 (TimeMap)</h2>
          <p>以前所未有的“上帝视角”，探索人类历史的共时性发展。</p>
          <ul className="info-list">
            <li>文明起源</li>
            <li>轴心时代</li>
            <li>大航海时代</li>
            <li>工业革命</li>
            <li>信息纪元</li>
          </ul>
          <button className="glass-btn">开始探索</button>
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
            <span>过去 (Past)</span>
            <span>现在 (Present)</span>
            <span>未来 (Future)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
