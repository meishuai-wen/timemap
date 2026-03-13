import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture, Html } from "@react-three/drei";
import { useRef, Suspense, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import "./App.css";
import { eventsDatabase, getEventsByDate, searchEventsDatabase } from "./data/eventsDatabase";
import type { HistoricalEvent } from "./data/mockEvents";
import CivilizationXRay from "./components/CivilizationXRay";

const MW = 10, MH = 5;
function ltp(lat: number, lng: number) { return new THREE.Vector3((lng/180)*(MW/2),(lat/90)*(MH/2),0.01); }

function ButterflyArc({s,e}:{s:THREE.Vector3;e:THREE.Vector3}) {
  const geom = useMemo(()=>{
    const dx = e.x - s.x; const dy = e.y - s.y; const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = -dy/dist; const ny = dx/dist; const m = s.clone().lerp(e,0.5);
    const cp = new THREE.Vector3(m.x + nx*dist*0.2, m.y + ny*dist*0.2, 0.01);
    const curve = new THREE.QuadraticBezierCurve3(s, cp, e);
    const points = curve.getPoints(60);
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6, dashSize: 0.08, gapSize: 0.04 });
    const line = new THREE.Line(g, mat);
    line.computeLineDistances();
    return { curve, line, mat };
  },[s,e]);
  const r = useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{
    if(r.current) r.current.position.copy(geom.curve.getPointAt((clock.getElapsedTime()*0.5)%1));
    if(geom.mat) (geom.mat as any).dashOffset = -clock.getElapsedTime() * 0.2;
  });
  return(<group>
    <primitive object={geom.line} />
    <mesh ref={r} position={s}><sphereGeometry args={[0.03,16,16]}/><meshBasicMaterial color="#fff"/><pointLight color="#00ffff" intensity={2} distance={1}/></mesh>
  </group>);
}

function BLines({sel}:{sel:HistoricalEvent|null}) {
  const arcs = useMemo(()=>{
    if(!sel?.relatedEventIds?.length) return[];
    const sp=ltp(sel.lat,sel.lng);
    const r:{s:THREE.Vector3;e:THREE.Vector3;id:string}[]=[];
    sel.relatedEventIds.forEach(id=>{
      for(const events of Object.values(eventsDatabase)) {
        const f = events.find(x => x.id === id);
        if(f){ r.push({s:sp,e:ltp(f.lat,f.lng),id}); break; }
      }
    });
    return r;
  },[sel]);
  return(<group>{arcs.map(a=><ButterflyArc key={a.id} s={a.s} e={a.e}/>)}</group>);
}

function EmpiresLayer({year, onSelectEmpire}:{year:number|undefined, onSelectEmpire:(id:string)=>void}) {
  const polys = useMemo(()=>{
    if(!year) return [];
    const res = [];
    if(year >= -221 && year <= -206) {
      const qinPts = [[100,20], [120,20], [120,40], [105,45], [95,35]].map(p=>ltp(p[1],p[0]));
      const shape = new THREE.Shape();
      shape.moveTo(qinPts[0].x, qinPts[0].y);
      for(let i=1;i<qinPts.length;i++) shape.lineTo(qinPts[i].x, qinPts[i].y);
      res.push({id:'qin', color:'#000000', shape});
    }
    if(year >= -27 && year <= 395) {
      const romePts = [[-10,30], [40,30], [40,45], [10,50], [-10,40]].map(p=>ltp(p[1],p[0]));
      const shape = new THREE.Shape();
      shape.moveTo(romePts[0].x, romePts[0].y);
      for(let i=1;i<romePts.length;i++) shape.lineTo(romePts[i].x, romePts[i].y);
      res.push({id:'rome', color:'#ff0000', shape});
    }
    return res;
  },[year]);
  return(<group>{polys.map(p=>(
    <mesh key={p.id} position={[0,0,0.0005]} onClick={(e) => { e.stopPropagation(); onSelectEmpire(p.id); }}>
      <shapeGeometry args={[p.shape]}/>
      <meshBasicMaterial color={p.color} transparent opacity={0.3} side={THREE.DoubleSide}/>
    </mesh>
  ))}</group>);
}

function MPulse({p}:{p:THREE.Vector3}) {
  const r=useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{
    if(r.current){
      const s=1+Math.sin(clock.getElapsedTime()*3)*0.3;
      r.current.scale.set(s,s,1);
      (r.current.material as THREE.MeshBasicMaterial).opacity=0.6-Math.sin(clock.getElapsedTime()*3)*0.3;
    }
  });
  return(<mesh ref={r} position={[p.x,p.y,0.005]}><ringGeometry args={[0.06,0.09,32]}/><meshBasicMaterial color="#ff4081" transparent opacity={0.6} side={THREE.DoubleSide}/></mesh>);
}

function Marker({event,onClick}:{event:HistoricalEvent;onClick:()=>void}) {
  const p=ltp(event.lat,event.lng);
  return(<group>
    <mesh position={p} onClick={e=>{e.stopPropagation();onClick();}}><circleGeometry args={[0.06,32]}/><meshBasicMaterial color="#ff4081"/></mesh>
    <MPulse p={p}/>
    <Html position={[p.x,p.y+0.15,0.02]} center>
      <div style={{color:'rgba(255,255,255,0.9)',background:'rgba(0,0,0,0.6)',padding:'2px 6px',borderRadius:'4px',cursor:'pointer',pointerEvents:'auto',fontSize:'10px',whiteSpace:'nowrap',backdropFilter:'blur(2px)',transition:'all 0.2s'}}
        onClick={e=>{e.stopPropagation();onClick();}}
        onPointerOver={e=>{e.currentTarget.style.background='rgba(0,0,0,0.85)';e.currentTarget.style.transform='scale(1.1)';}}
        onPointerOut={e=>{e.currentTarget.style.background='rgba(0,0,0,0.6)';e.currentTarget.style.transform='scale(1)';}}
      >{event.title}</div>
    </Html>
  </group>);
}

function CamCtrl() {
  const{camera,gl}=useThree();const dr=useRef(false);const lm=useRef({x:0,y:0});
  useEffect(()=>{const d=gl.domElement;
    const wh=(e:WheelEvent)=>{e.preventDefault();const o=camera as THREE.OrthographicCamera;o.zoom=Math.max(40,Math.min(500,o.zoom*(e.deltaY>0?0.9:1.1)));o.updateProjectionMatrix();};
    const dn=(e:PointerEvent)=>{dr.current=true;lm.current={x:e.clientX,y:e.clientY};d.setPointerCapture(e.pointerId);};
    const mv=(e:PointerEvent)=>{if(!dr.current)return;const s=1/(camera as THREE.OrthographicCamera).zoom;camera.position.x-=(e.clientX-lm.current.x)*s;camera.position.y+=(e.clientY-lm.current.y)*s;lm.current={x:e.clientX,y:e.clientY};};
    const up=(e:PointerEvent)=>{dr.current=false;d.releasePointerCapture(e.pointerId);};
    d.addEventListener('wheel',wh,{passive:false});d.addEventListener('pointerdown',dn);d.addEventListener('pointermove',mv);d.addEventListener('pointerup',up);
    return()=>{d.removeEventListener('wheel',wh);d.removeEventListener('pointerdown',dn);d.removeEventListener('pointermove',mv);d.removeEventListener('pointerup',up);};
  },[camera,gl]);return null;
}

function Grid() {
  const lines=useMemo(()=>{const p:THREE.Vector3[][]=[];const z=0.002;
    for(let g=-180;g<=180;g+=30){const x=(g/180)*(MW/2);p.push([new THREE.Vector3(x,-MH/2,z),new THREE.Vector3(x,MH/2,z)]);}
    for(let a=-90;a<=90;a+=30){const y=(a/90)*(MH/2);p.push([new THREE.Vector3(-MW/2,y,z),new THREE.Vector3(MW/2,y,z)]);}return p;},[]);
  return(<group>
    {lines.map((pr,i)=>(<line key={i}><bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(pr)}/><lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.12}/></line>))}
    <line><bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-MW/2,0,0.003),new THREE.Vector3(MW/2,0,0.003)])}/><lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3}/></line>
    <line><bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-MH/2,0.003),new THREE.Vector3(0,MH/2,0.003)])}/><lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3}/></line>
  </group>);
}

function WMap({events,onSel,sel,onSelectEmpire}:{events:HistoricalEvent[],onSel:(e:HistoricalEvent)=>void,sel:HistoricalEvent|null,onSelectEmpire:(id:string)=>void}) {
  const[cm]=useTexture(['https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Equirectangular-projection.jpg/1280px-Equirectangular-projection.jpg']);
  return(<group>
    <mesh onPointerMissed={() => onSelectEmpire('')}><planeGeometry args={[MW,MH]}/><meshStandardMaterial map={cm} roughness={0.8} metalness={0} side={THREE.DoubleSide}/></mesh>
    <Grid/>
    <EmpiresLayer year={sel?.year} onSelectEmpire={onSelectEmpire} />
    <lineLoop><bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-MW/2,-MH/2,0.001),new THREE.Vector3(MW/2,-MH/2,0.001),new THREE.Vector3(MW/2,MH/2,0.001),new THREE.Vector3(-MW/2,MH/2,0.001)])}/><lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3}/></lineLoop>
    {events.map(ev=><Marker key={ev.id} event={ev} onClick={()=>onSel(ev)}/>)}
    <BLines sel={sel}/>
  </group>);
}

const MONTHS = Array.from({length: 12}, (_, i) => i + 1);
const getDaysInMonth = (month: number) => {
  if (month === 2) return 29; // Allow 29 for Feb
  if ([4,6,9,11].includes(month)) return 30;
  return 31;
};

function App() {
  const t = new Date();
  const [mo, setMo] = useState(t.getMonth() + 1);
  const [dy, setDy] = useState(t.getDate());
  const [sel, setSel] = useState<HistoricalEvent|null>(null);
  const [fl, setFl] = useState(false);
  const [sq, setSq] = useState("");
  const [sr, setSr] = useState<HistoricalEvent[]>([]);
  const [selEmp, setSelEmp] = useState<'qin'|'rome'|null>(null);

  const dateKey = `${mo.toString().padStart(2, '0')}-${dy.toString().padStart(2, '0')}`;
  const evs: HistoricalEvent[] = getEventsByDate(dateKey);

  const availableDates = Object.keys(eventsDatabase).map(key => {
    const [m, d] = key.split('-');
    return { m: parseInt(m, 10), d: parseInt(d, 10), c: eventsDatabase[key].length };
  });

  const qd = (m: number, d: number) => {
    setMo(m); setDy(d); setSel(null); setFl(true); setTimeout(() => setFl(false), 500);
  };

  const hs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value; setSq(q);
    if (!q.trim()) { setSr([]); return; }
    setSr(searchEventsDatabase(q));
  };

  const hsr = (ev: HistoricalEvent) => {
    for (const [key, events] of Object.entries(eventsDatabase)) {
      if (events.find(e => e.id === ev.id)) {
        const [mStr, dStr] = key.split('-');
        const m = parseInt(mStr, 10);
        const d = parseInt(dStr, 10);
        if (m !== mo || d !== dy) {
          setMo(m); setDy(d); setFl(true); setTimeout(() => setFl(false), 500);
        }
        break;
      }
    }
    setSel(ev); setSr([]); setSq('');
  };

  return (
    <div className="app-container">
      {fl && <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(255,255,255,0.3)',pointerEvents:'none',zIndex:100}}/>}
      <div className="canvas-container">
        <Canvas orthographic camera={{position:[0,0,10],zoom:120,near:0.1,far:100}}>
          <ambientLight intensity={2}/><pointLight position={[0,0,10]} intensity={1}/>
          <Stars radius={100} depth={50} count={fl?10000:3000} factor={4} saturation={0} fade speed={fl?3:1}/>
          <Suspense fallback={null}><WMap events={evs} onSel={setSel} sel={sel} onSelectEmpire={(id)=>{if(id==="qin"||id==="rome")setSelEmp(id);else setSelEmp(null);}}/></Suspense>
          <CamCtrl/>
        </Canvas>
      </div>
      <CivilizationXRay selectedId={selEmp} onClose={()=>setSelEmp(null)} />
      <div className="ui-overlay">
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, pointerEvents: 'auto' }}>
          <button 
            onClick={() => setSelEmp('qin')}
            style={{ 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>⚔️</span> 进入文明透视仪
          </button>
        </div>
        <div className="sidebar glass-panel" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          
          <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{margin:'0 0 12px 0',fontSize:'20px',color:'#61dafb',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <span role="img" aria-label="calendar">📅</span> 历史上的今天
            </h2>
            <div style={{display:'flex', gap:'8px', justifyContent:'center', alignItems:'center'}}>
              <select value={mo} onChange={(e) => {
                const newMo = parseInt(e.target.value, 10);
                setMo(newMo);
                const maxDays = getDaysInMonth(newMo);
                if (dy > maxDays) setDy(maxDays);
                setSel(null);
              }} style={{padding:'8px 12px', borderRadius:'6px', background:'rgba(20,20,20,0.8)', color:'white', border:'1px solid rgba(255,255,255,0.3)', outline:'none', cursor:'pointer'}}>
                {MONTHS.map(m => <option key={m} value={m}>{m} 月</option>)}
              </select>
              <select value={dy} onChange={(e) => {
                setDy(parseInt(e.target.value, 10));
                setSel(null);
              }} style={{padding:'8px 12px', borderRadius:'6px', background:'rgba(20,20,20,0.8)', color:'white', border:'1px solid rgba(255,255,255,0.3)', outline:'none', cursor:'pointer'}}>
                {Array.from({length: getDaysInMonth(mo)}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d} 日</option>)}
              </select>
            </div>
            <div style={{fontSize:'12px',color:'#aaa',marginTop:'8px'}}>{evs.length > 0 ? `共 ${evs.length} 件历史大事` : '暂无该日期的历史数据'}</div>
          </div>

          <div style={{position:'relative'}}>
            <input type="text" value={sq} onChange={hs} placeholder="搜索事件（关键词或年份）..." style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.3)',color:'white',background:'rgba(20,20,20,0.6)',outline:'none',fontSize:'14px',boxSizing:'border-box'}}/>
            {sr.length>0&&(<ul style={{position:'absolute',top:'100%',left:0,width:'100%',listStyle:'none',padding:'8px 0',margin:'6px 0 0 0',background:'rgba(20,20,20,0.95)',backdropFilter:'blur(10px)',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.2)',maxHeight:'250px',overflowY:'auto',zIndex:1000}}>
              {sr.map(ev=>(<li key={`s-${ev.id}`} onClick={()=>hsr(ev)} style={{padding:'8px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.08)',transition:'background 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{color:'#61dafb',fontWeight:'bold',fontSize:'13px'}}>{ev.title}</div>
                <div style={{fontSize:'11px',color:'#aaa',marginTop:'2px'}}>{ev.year>0?`公元${ev.year}年`:`公元前${Math.abs(ev.year)}年`} · {ev.region}</div>
              </li>))}</ul>)}
          </div>
          
          <div style={{flex:1,overflowY:'auto', paddingRight:'4px'}}>
            {evs.length>0?(<ul style={{listStyle:'none',padding:0,margin:0}}>{evs.map(ev=>(
              <li key={ev.id} onClick={()=>setSel(ev)} style={{cursor:'pointer',padding:'12px',marginBottom:'10px',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',backgroundColor:sel?.id===ev.id?'rgba(97,218,251,0.2)':'rgba(0,0,0,0.2)',transition:'all 0.2s',boxShadow:sel?.id===ev.id?'0 0 10px rgba(97,218,251,0.2)':'none'}}>
                <div style={{fontWeight:'bold',fontSize:'15px',color:sel?.id===ev.id?'#fff':'#e0e0e0'}}>{ev.title}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'6px'}}>
                  <div style={{fontSize:'13px',color:'#ffb300',fontWeight:'500'}}>{ev.year>0?`公元 ${ev.year} 年`:`公元前 ${Math.abs(ev.year)} 年`}</div>
                  <div style={{fontSize:'12px',color:'#999',background:'rgba(255,255,255,0.1)',padding:'2px 6px',borderRadius:'4px'}}>{ev.region}</div>
                </div>
              </li>))}</ul>):(<div style={{textAlign:'center',color:'#666',padding:'40px 0',fontSize:'14px'}}>📭 史海茫茫<br/><span style={{fontSize:'12px'}}>这一天似乎很平静...</span></div>)}
          </div>
          
          {sel&&(<div style={{borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'16px',marginTop:'auto'}}>
            <h3 style={{margin:'0 0 8px 0',color:'#61dafb',fontSize:'18px'}}>{sel.title}</h3>
            <div style={{fontSize:'13px',color:'#ffb300',marginBottom:'10px',fontWeight:'500'}}>{sel.year>0?`公元 ${sel.year} 年`:`公元前 ${Math.abs(sel.year)} 年`} · {sel.region}</div>
            <p style={{fontSize:'14px',lineHeight:'1.6',margin:0,color:'rgba(255,255,255,0.9)',textAlign:'justify'}}>{sel.description}</p>
          </div>)}
        </div>
        
        <div className="timeline-container glass-panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',padding:'0 16px'}}>
            <span style={{fontSize:'13px',color:'#aaa',fontWeight:'bold'}}>数据档案库：</span>
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {availableDates.map(({m,d,c})=>(<div key={`${m}-${d}`} onClick={()=>qd(m,d)} style={{cursor:'pointer',padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'500',backgroundColor:m===mo&&d===dy?'rgba(97,218,251,0.3)':'rgba(0,0,0,0.3)',border:m===mo&&d===dy?'1px solid #61dafb':'1px solid rgba(255,255,255,0.1)',transition:'all 0.2s',whiteSpace:'nowrap',boxShadow:m===mo&&d===dy?'0 0 8px rgba(97,218,251,0.3)':'none'}}>{m}月{d}日 <span style={{fontSize:'11px',color:m===mo&&d===dy?'#fff':'#888'}}>({c})</span></div>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
