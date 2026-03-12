import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture, Html } from "@react-three/drei";
import { useRef, Suspense, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import "./App.css";
import { daySlices, getSliceByDate, searchAllEvents } from "./data/mockEvents";
import type { HistoricalEvent } from "./data/mockEvents";
const MW = 10, MH = 5;
function ltp(lat: number, lng: number) { return new THREE.Vector3((lng/180)*(MW/2),(lat/90)*(MH/2),0.01); }
function ButterflyArc({s,e}:{s:THREE.Vector3;e:THREE.Vector3}) {
  const pts = useMemo(()=>{const m=s.clone().lerp(e,0.5);return new THREE.QuadraticBezierCurve3(s,new THREE.Vector3(m.x,m.y,s.distanceTo(e)*0.3),e).getPoints(50);},[s,e]);
  const c = useMemo(()=>new THREE.CatmullRomCurve3(pts),[pts]);
  const r = useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{if(r.current)r.current.position.copy(c.getPointAt((clock.getElapsedTime()*0.6)%1));});
  return(<group><line><bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(pts)}/><lineBasicMaterial attach="material" color="#00ffff" transparent opacity={0.5}/></line><mesh ref={r}><sphereGeometry args={[0.04,16,16]}/><meshBasicMaterial color="#fff"/><pointLight color="#00ffff" intensity={2} distance={1}/></mesh></group>);
}
function BLines({sel}:{sel:HistoricalEvent|null}) {
  const arcs = useMemo(()=>{if(!sel?.relatedEventIds?.length)return[];const sp=ltp(sel.lat,sel.lng);const r:{s:THREE.Vector3;e:THREE.Vector3;id:string}[]=[];sel.relatedEventIds.forEach(id=>{for(const sl of daySlices){const f=sl.events.find(x=>x.id===id);if(f){r.push({s:sp,e:ltp(f.lat,f.lng),id});break;}}});return r;},[sel]);
  return(<group>{arcs.map(a=><ButterflyArc key={a.id} s={a.s} e={a.e}/>)}</group>);
}
function MPulse({p}:{p:THREE.Vector3}) {
  const r=useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{if(r.current){const s=1+Math.sin(clock.getElapsedTime()*3)*0.3;r.current.scale.set(s,s,1);(r.current.material as THREE.MeshBasicMaterial).opacity=0.6-Math.sin(clock.getElapsedTime()*3)*0.3;}});
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
function WMap({events,onSel,sel}:{events:HistoricalEvent[],onSel:(e:HistoricalEvent)=>void,sel:HistoricalEvent|null}) {
  const[cm]=useTexture(['https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Equirectangular-projection.jpg/1280px-Equirectangular-projection.jpg']);
  return(<group>
    <mesh><planeGeometry args={[MW,MH]}/><meshStandardMaterial map={cm} roughness={0.8} metalness={0} side={THREE.DoubleSide}/></mesh>
    <Grid/>
    <lineLoop><bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-MW/2,-MH/2,0.001),new THREE.Vector3(MW/2,-MH/2,0.001),new THREE.Vector3(MW/2,MH/2,0.001),new THREE.Vector3(-MW/2,MH/2,0.001)])}/><lineBasicMaterial attach="material" color="#61dafb" transparent opacity={0.3}/></lineLoop>
    {events.map(ev=><Marker key={ev.id} event={ev} onClick={()=>onSel(ev)}/>)}
    <BLines sel={sel}/>
  </group>);
}
function App() {
  const t=new Date();const[mo,setMo]=useState(t.getMonth()+1);const[dy,setDy]=useState(t.getDate());
  const[di,setDi]=useState(`${t.getMonth()+1}月${t.getDate()}日`);const[sel,setSel]=useState<HistoricalEvent|null>(null);
  const[fl,setFl]=useState(false);const[sq,setSq]=useState("");const[sr,setSr]=useState<HistoricalEvent[]>([]);
  const cs=getSliceByDate(mo,dy);const evs=cs?.events||[];
  const ad=daySlices.map(s=>({m:s.month,d:s.day,c:s.events.length}));
  const submit=()=>{const i=di.trim();let m=0,d=0;
    const a=i.match(/^(\d{1,2})\s*月\s*(\d{1,2})\s*日?$/),b=i.match(/^(\d{1,2})[\/\-](\d{1,2})$/),c=i.match(/^(\d{2})(\d{2})$/);
    if(a){m=+a[1];d=+a[2];}else if(b){m=+b[1];d=+b[2];}else if(c){m=+c[1];d=+c[2];}
    if(m>=1&&m<=12&&d>=1&&d<=31){setMo(m);setDy(d);setSel(null);setFl(true);setTimeout(()=>setFl(false),500);}};
  const qd=(m:number,d:number)=>{setMo(m);setDy(d);setDi(`${m}月${d}日`);setSel(null);setFl(true);setTimeout(()=>setFl(false),500);};
  const hs=(e:React.ChangeEvent<HTMLInputElement>)=>{const q=e.target.value;setSq(q);if(!q.trim()){setSr([]);return;}
    const dm=q.match(/^(\d{1,2})\s*月\s*(\d{1,2})\s*日?$/)||q.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
    if(dm){const s=getSliceByDate(+dm[1],+dm[2]);if(s){setSr(s.events);return;}}setSr(searchAllEvents(q));};
  const hsr=(ev:HistoricalEvent)=>{for(const s of daySlices){if(s.events.find(e=>e.id===ev.id)){
    if(s.month!==mo||s.day!==dy){setMo(s.month);setDy(s.day);setDi(`${s.month}月${s.day}日`);setFl(true);setTimeout(()=>setFl(false),500);}break;}}
    setSel(ev);setSr([]);setSq('');};
  return(
    <div className="app-container">
      {fl&&<div style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(255,255,255,0.3)',pointerEvents:'none',zIndex:100}}/>}
      <div className="canvas-container">
        <Canvas orthographic camera={{position:[0,0,10],zoom:120,near:0.1,far:100}}>
          <ambientLight intensity={2}/><pointLight position={[0,0,10]} intensity={1}/>
          <Stars radius={100} depth={50} count={fl?10000:3000} factor={4} saturation={0} fade speed={fl?3:1}/>
          <Suspense fallback={null}><WMap events={evs} onSel={setSel} sel={sel}/></Suspense>
          <CamCtrl/>
        </Canvas>
      </div>
      <div className="ui-overlay">
        <div className="sidebar glass-panel" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div><h2 style={{margin:'0 0 8px 0',fontSize:'20px'}}>📅 历史上的今天</h2>
            <div style={{display:'flex',gap:'8px'}}>
              <input type="text" value={di} onChange={e=>setDi(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submit()}} placeholder="输入日期，如：3月11日" style={{flex:1,padding:'10px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.3)',color:'white',background:'rgba(20,20,20,0.6)',outline:'none',fontSize:'14px'}}/>
              <button onClick={submit} style={{padding:'10px 16px',borderRadius:'8px',border:'1px solid rgba(97,218,251,0.5)',background:'rgba(97,218,251,0.2)',color:'white',cursor:'pointer',fontSize:'14px'}}>查询</button>
            </div>
            <div style={{fontSize:'11px',color:'#888',marginTop:'4px'}}>支持格式：3月11日、3/11、3-11、0311</div>
          </div>
          <div style={{position:'relative'}}>
            <input type="text" value={sq} onChange={hs} placeholder="搜索事件（关键词或日期）..." style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.3)',color:'white',background:'rgba(20,20,20,0.6)',outline:'none',fontSize:'14px',boxSizing:'border-box'}}/>
            {sr.length>0&&(<ul style={{position:'absolute',top:'100%',left:0,width:'100%',listStyle:'none',padding:'8px 0',margin:'6px 0 0 0',background:'rgba(20,20,20,0.95)',backdropFilter:'blur(10px)',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.2)',maxHeight:'250px',overflowY:'auto',zIndex:1000}}>
              {sr.map(ev=>(<li key={`s-${ev.id}`} onClick={()=>hsr(ev)} style={{padding:'8px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.08)',transition:'background 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{color:'#61dafb',fontWeight:'bold',fontSize:'13px'}}>{ev.title}</div>
                <div style={{fontSize:'11px',color:'#aaa',marginTop:'2px'}}>{ev.year>0?`公元${ev.year}年`:`公元前${Math.abs(ev.year)}年`} · {ev.region}</div>
              </li>))}</ul>)}
          </div>
          <div style={{textAlign:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
            <div style={{fontSize:'28px',fontWeight:'bold',color:'#61dafb'}}>{mo}月{dy}日</div>
            <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>{cs?`共 ${evs.length} 件历史大事`:'暂无该日期的历史数据'}</div>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {evs.length>0?(<ul style={{listStyle:'none',padding:0,margin:0}}>{evs.map(ev=>(
              <li key={ev.id} onClick={()=>setSel(ev)} style={{cursor:'pointer',padding:'10px',marginBottom:'8px',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',backgroundColor:sel?.id===ev.id?'rgba(97,218,251,0.15)':'transparent',transition:'all 0.2s'}}>
                <div style={{fontWeight:'bold',fontSize:'14px'}}>{ev.title}</div>
                <div style={{fontSize:'12px',color:'#ffb300',marginTop:'2px'}}>{ev.year>0?`公元 ${ev.year} 年`:`公元前 ${Math.abs(ev.year)} 年`}</div>
                <div style={{fontSize:'11px',color:'#999',marginTop:'2px'}}>{ev.region}</div>
              </li>))}</ul>):(<div style={{textAlign:'center',color:'#666',padding:'30px 0',fontSize:'14px'}}>📭 该日期暂无数据<br/><span style={{fontSize:'12px'}}>试试其他日期吧</span></div>)}
          </div>
          {sel&&(<div style={{borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'12px'}}>
            <h3 style={{margin:'0 0 6px 0',color:'#61dafb',fontSize:'16px'}}>{sel.title}</h3>
            <div style={{fontSize:'13px',color:'#ffb300',marginBottom:'6px'}}>{sel.year>0?`公元 ${sel.year} 年`:`公元前 ${Math.abs(sel.year)} 年`} · {sel.region}</div>
            <p style={{fontSize:'13px',lineHeight:'1.6',margin:0,color:'rgba(255,255,255,0.85)'}}>{sel.description}</p>
          </div>)}
        </div>
        <div className="timeline-container glass-panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',padding:'0 16px'}}>
            <span style={{fontSize:'12px',color:'#888'}}>快捷日期：</span>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {ad.map(({m,d,c})=>(<div key={`${m}-${d}`} onClick={()=>qd(m,d)} style={{cursor:'pointer',padding:'4px 12px',borderRadius:'16px',fontSize:'13px',backgroundColor:m===mo&&d===dy?'rgba(97,218,251,0.3)':'transparent',border:m===mo&&d===dy?'1px solid #61dafb':'1px solid rgba(255,255,255,0.2)',transition:'all 0.3s',whiteSpace:'nowrap'}}>{m}月{d}日 <span style={{fontSize:'10px',color:'#888'}}>({c})</span></div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
export default App;
