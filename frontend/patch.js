import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(
  'const[fl,setFl]=useState(false);const[sq,setSq]=useState("");const[sr,setSr]=useState<HistoricalEvent[]>([]);',
  'const[fl,setFl]=useState(false);const[sq,setSq]=useState("");const[sr,setSr]=useState<HistoricalEvent[]>([]);\n  const[selEmp,setSelEmp]=useState<\'qin\'|\'rome\'|null>(null);'
);
c = c.replace(
  '<WMap events={evs} onSel={setSel} sel={sel}/>',
  '<WMap events={evs} onSel={setSel} sel={sel} onSelectEmpire={(id)=>{if(id==="qin"||id==="rome")setSelEmp(id);else setSelEmp(null);}}/>'
);
c = c.replace(
  '      <div className="ui-overlay">',
  '      <CivilizationXRay selectedId={selEmp} onClose={()=>setSelEmp(null)} />\n      <div className="ui-overlay">'
);
fs.writeFileSync('src/App.tsx', c);
