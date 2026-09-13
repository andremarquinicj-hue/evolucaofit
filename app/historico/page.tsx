'use client';
import { useMemo, useState } from 'react';
import { ChevronIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';

export default function Historico(){
  const {state}=useApp(); const [filter,setFilter]=useState<'todos'|'recordes'>('todos');
  const sessions=useMemo(()=>state.sessions.filter(s=>filter==='todos'||s.records>0),[state.sessions,filter]);
  return <><header className="topbar"><div><h1>Meu histórico</h1><p>Seus treinos, recordes e consistência.</p></div><div className="routine-icon"><TrophyIcon/></div></header>
  <div className="tabs"><button className={filter==='todos'?'tab active':'tab'} onClick={()=>setFilter('todos')}>Todos</button><button className="tab">Treinos</button><button className={filter==='recordes'?'tab active':'tab'} onClick={()=>setFilter('recordes')}>Recordes</button></div>
  <div className="card history-list">{sessions.length===0?<div className="empty">Nenhum treino neste filtro.</div>:sessions.map(s=>{const d=new Date(`${s.date}T12:00:00`);return <div className="history-row" key={s.id}><div className="date-badge"><strong>{String(d.getDate()).padStart(2,'0')}</strong>{d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()}</div><div><h3>{s.title}</h3><p>{s.exercises.length} exercícios • {s.durationMin} min</p>{s.records>0&&<span className="record-pill">{s.records} {s.records===1?'recorde':'recordes'}</span>}</div><ChevronIcon size={18}/></div>})}</div>
  <div className="section card quote">“Disciplina hoje, resultados amanhã.” ♡</div></>
}
