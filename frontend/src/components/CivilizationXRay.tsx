import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

type EmpireId = 'qin' | 'rome' | null;

interface CivilizationXRayProps {
  selectedId: EmpireId;
  onClose: () => void;
}

const CIVILIZATION_DATA = {
  qin: {
    name: '大秦帝国',
    color: '#82ca9d',
    military: {
      standingArmy: '约100万',
      mainTroops: '步兵、弩兵、车兵',
      weaponMaterials: '青铜为主，少量铁器'
    },
    livelihood: {
      population: '约2000万 - 3000万',
      lifeExpectancy: '约30岁',
      stapleFood: '粟、麦、豆类'
    }
  },
  rome: {
    name: '罗马帝国',
    color: '#8884d8',
    military: {
      standingArmy: '约30万 - 45万',
      mainTroops: '重装步兵军团',
      weaponMaterials: '铁器为主 (如短剑 Gladius)'
    },
    livelihood: {
      population: '约4500万 - 6000万',
      lifeExpectancy: '约25-30岁',
      stapleFood: '小麦、橄榄油、葡萄酒'
    }
  }
};

const RADAR_DATA = [
  { subject: '动员力', qin: 95, rome: 85, fullMark: 100 },
  { subject: '科技力', qin: 75, rome: 80, fullMark: 100 },
  { subject: '经济力', qin: 80, rome: 90, fullMark: 100 },
  { subject: '统治力', qin: 90, rome: 75, fullMark: 100 },
  { subject: '基建力', qin: 95, rome: 90, fullMark: 100 },
  { subject: '文化力', qin: 70, rome: 95, fullMark: 100 },
];

const CivilizationXRay: React.FC<CivilizationXRayProps> = ({ selectedId, onClose }) => {
  const isOpen = selectedId !== null;
  const primaryId = selectedId === 'rome' ? 'rome' : 'qin';
  const secondaryId = selectedId === 'rome' ? 'qin' : 'rome';
  
  const primary = CIVILIZATION_DATA[primaryId];
  const secondary = CIVILIZATION_DATA[secondaryId];

  return (
    <div 
      className={`xray-dashboard glass-panel ${isOpen ? 'open' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        right: isOpen ? 0 : '-400px',
        width: '360px',
        height: '100%',
        transition: 'right 0.3s ease-in-out',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        background: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#61dafb' }}>🔍 文明透视仪</h2>
        <button 
          onClick={onClose} 
          style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
        >
          ✖
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#aaa', marginTop: '-15px', marginBottom: '20px' }}>V3.0 疆域与年代对比数据</p>

      {/* Radar Chart */}
      <div style={{ height: '240px', width: '100%', marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#ccc', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="大秦帝国" dataKey="qin" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
            <Radar name="罗马帝国" dataKey="rome" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #444', color: '#fff' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Military Index */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#ffb300', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>⚔️ 军力指数</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: primary.color }}>{primary.name}</strong>
              <ul style={{ paddingLeft: '15px', margin: '5px 0', color: '#ccc' }}>
                <li>规模: {primary.military.standingArmy}</li>
                <li>兵种: {primary.military.mainTroops}</li>
                <li>武器: {primary.military.weaponMaterials}</li>
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: secondary.color }}>{secondary.name}</strong>
              <ul style={{ paddingLeft: '15px', margin: '5px 0', color: '#ccc' }}>
                <li>规模: {secondary.military.standingArmy}</li>
                <li>兵种: {secondary.military.mainTroops}</li>
                <li>武器: {secondary.military.weaponMaterials}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Livelihood Index */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#4caf50', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>🌾 民生指数</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: primary.color }}>{primary.name}</strong>
              <ul style={{ paddingLeft: '15px', margin: '5px 0', color: '#ccc' }}>
                <li>人口: {primary.livelihood.population}</li>
                <li>寿命: {primary.livelihood.lifeExpectancy}</li>
                <li>主食: {primary.livelihood.stapleFood}</li>
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: secondary.color }}>{secondary.name}</strong>
              <ul style={{ paddingLeft: '15px', margin: '5px 0', color: '#ccc' }}>
                <li>人口: {secondary.livelihood.population}</li>
                <li>寿命: {secondary.livelihood.lifeExpectancy}</li>
                <li>主食: {secondary.livelihood.stapleFood}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CivilizationXRay;
