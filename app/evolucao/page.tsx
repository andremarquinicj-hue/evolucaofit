'use client';
import { useMemo, useState } from 'react';
import { ChartIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';

function linePoints(values:number[],w=320,h=150){if(!values.length)return'';const max=Math.max(...values,1),min=Math.min(...values,0);return values.map((v,i)=>{const x=values.length===1?w/2:(i/(values.length-1))*w;const y=h-((v-min)/(max-min||1))*(h-30)-15;return `${x},${y}`}).join(' ')}
export default function Evolucao(){
  const {state}=useApp(); const exercises=useMemo(()=>{const m=new Map<string,string>();state.routines.forEach(r=>r.exercises.forEach(e=>m.set(e.id,e.name)));return [...m.entries()]},[state.routines]);
  const [selected,setSelected]=useState(exercises.find(([id])=>id==='leg-press')?.[0]||exercises[0]?.[0]||'');
  const history=useMemo(()=>state.sessions.slice().reverse().flatMap(s=>s.exercises.filter(e=>e.exerciseId===selected).map(e=>({date:s.date,load:e.bestLoad}))).filter(x=>x.load>0),[state.sessions,selected]);
  const values=history.map(x=>x.load), initial=values[0]||0,current=values.at(-1)||0,best=Math.max(0,...values),growth=initial?((current-initial)/initial)*100:0; const points=linePoints(values);
  const latestM=state.measurements.at(-1),firstM=state.measurements[0];
  return <><header className="topbar"><div><h1>Evolução</h1><p>Acompanhe seus resultados treino após treino.</p></div><div className="routine-icon"><ChartIcon/></div></header>
    <div className="tabs"><button className="tab active">Carga</button><button className="tab">Medidas</button><button className="tab">Peso</button><button className="tab">Fotos</button></div>
    <section className="card chart-card"><select className="select-big" value={selected} onChange={e=>setSelected(e.target.value)}>{exercises.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select><div className="chart"><div className="chart-grid"><span/><span/><span/><span/></div>{values.length>0&&<svg viewBox="0 0 320 165" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="#9d60b3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>}<div className="chart-labels"><span>{history[0]?.date?new Date(history[0].date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—'}</span><span>{history.at(-1)?.date?new Date(history.at(-1)!.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—'}</span></div></div>
    <div className="metric-grid"><div className="metric"><span>Carga inicial</span><strong>{initial} kg</strong></div><div className="metric"><span>Carga atual</span><strong>{current} kg</strong></div><div className="metric"><span>Evolução</span><strong className="green">{growth>=0?'+':''}{growth.toFixed(0)}%</strong></div><div className="metric"><span>Maior carga</span><strong>{best} kg</strong></div></div></section>
    <section className="section"><div className="section-head"><h2>Meu corpo</h2><span className="badge">Última medição</span></div><div className="grid-2"><div className="card stat-card"><div className="stat-icon"><ChartIcon/></div><strong>{latestM?.weight??'—'} kg</strong><span>Peso atual {firstM?.weight&&latestM?.weight?`(${(latestM.weight-firstM.weight).toFixed(1)} kg desde o início)`:''}</span></div><div className="card stat-card"><div className="stat-icon"><TrophyIcon/></div><strong>{latestM?.thigh??'—'} cm</strong><span>Medida de coxa registrada</span></div></div></section>
  </>
}
