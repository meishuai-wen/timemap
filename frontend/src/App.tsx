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
          <h2>TimeMap</h2>
          <p>Explore the timeline of the universe and human history.</p>
          <ul className="info-list">
            <li>Big Bang</li>
            <li>Formation of Earth</li>
            <li>First Life</li>
            <li>Dinosaurs</li>
            <li>Human Era</li>
          </ul>
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
            <span>Past</span>
            <span>Present</span>
            <span>Future</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
