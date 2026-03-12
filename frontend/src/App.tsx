import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, useTexture } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import "./App.css";

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  // 加载真实的高清地球纹理贴图
  const [colorMap] = useTexture(['https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg']);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001; // 地球自转
    }
  });

  return (
    <mesh ref={earthRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}

function App() {
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
            <Earth />
          </Suspense>
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
          <button className="glass-btn" onClick={handleStartExplore}>开始探索</button>
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
