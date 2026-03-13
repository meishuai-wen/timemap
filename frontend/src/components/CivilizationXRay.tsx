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
      mainTroops: '步兵、弩兵、战车',
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
      weaponMaterials: '铁器为主 (如短剑Gladius)'
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
      className={`xray-dashboard ${isOpen ? 'open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-450px',
        width: '400px',
        height: '100vh',
        transition: 'right 0.3s ease-in-out',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        overflowY: 'auto',
        boxSizing: 'border-box',
        boxShadow: '-5px 0 25px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#38bdf8', fontWeight: 'bold' }}>🔍 文明透视仪</h2>
        <button 
          onClick={onClose} 
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ✕
        </button>
      </div>

      {/* Radar Chart */}
      <div style={{ height: '280px', width: '100%', marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={RADAR_DATA}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0', fontSize: 13 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="大秦帝国" dataKey="qin" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
            <Radar name="罗马帝国" dataKey="rome" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Military Index */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚔️</span> 军力硬核对比
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '14px' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: primary.color, fontSize: '16px' }}>{primary.name}</strong>
              <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <div><span style={{color: '#94a3b8'}}>常备军:</span> {primary.military.standingArmy}</div>
                <div><span style={{color: '#94a3b8'}}>核心兵种:</span> {primary.military.mainTroops}</div>
                <div><span style={{color: '#94a3b8'}}>武器图鉴:</span> {primary.military.weaponMaterials}</div>
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: secondary.color, fontSize: '16px' }}>{secondary.name}</strong>
              <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <div><span style={{color: '#94a3b8'}}>常备军:</span> {secondary.military.standingArmy}</div>
                <div><span style={{color: '#94a3b8'}}>核心兵种:</span> {secondary.military.mainTroops}</div>
                <div><span style={{color: '#94a3b8'}}>武器图鉴:</span> {secondary.military.weaponMaterials}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Livelihood Index */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌾</span> 民生数据透视
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '14px' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: primary.color, fontSize: '16px' }}>{primary.name}</strong>
              <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <div><span style={{color: '#94a3b8'}}>人口规模:</span> {primary.livelihood.population}</div>
                <div><span style={{color: '#94a3b8'}}>平均寿命:</span> {primary.livelihood.lifeExpectancy}</div>
                <div><span style={{color: '#94a3b8'}}>主食结构:</span> {primary.livelihood.stapleFood}</div>
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: secondary.color, fontSize: '16px' }}>{secondary.name}</strong>
              <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <div><span style={{color: '#94a3b8'}}>人口规模:</span> {secondary.livelihood.population}</div>
                <div><span style={{color: '#94a3b8'}}>平均寿命:</span> {secondary.livelihood.lifeExpectancy}</div>
                <div><span style={{color: '#94a3b8'}}>主食结构:</span> {secondary.livelihood.stapleFood}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CivilizationXRay;
