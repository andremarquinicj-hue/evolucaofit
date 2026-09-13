'use client';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckIcon, DumbbellIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';
import type { SetEntry } from '@/lib/types';

export default function Treino(){
  const {state,saveWorkout}=useApp(); const router=useRouter(); const params=useSearchParams();
  const routine=state.routines.find(r=>r.id===(params.get('dia')||'segunda')) || state.routines.find(r=>!r.rest)!;
  const [index,setIndex]=useState(0); const [startedAt]=useState(Date.now()); const [finished,setFinished]=useState<Record<string,boolean>>({});
  const [entries,setEntries]=useState<Record<string,SetEntry[]>>(()=>Object.fromEntries(routine.exercises.map(ex=>[ex.id,Array.from({length:ex.defaultSets},()=>({load:ex.defaultLoad,reps:ex.defaultReps}))])));
  const ex=routine.exercises[index];
  const previousBest=useMemo(()=>ex?Math.max(0,...state.sessions.flatMap(s=>s.exercises.filter(e=>e.exerciseId===ex.id).map(e=>e.bestLoad))):0,[state.sessions,ex]);
  if(!ex) return <div className="card empty">Este treino ainda não tem exercícios.</div>;
  const currentBest=Math.max(...entries[ex.id].map(s=>Number(s.load)||0)); const record=currentBest>previousBest&&previousBest>0;
  const setVal=(i:number,key:'load'|'reps',v:number)=>setEntries(prev=>({...prev,[ex.id]:prev[ex.id].map((s,n)=>n===i?{...s,[key]:v}:s)}));
  async function finish(){const mins=Math.max(1,Math.round((Date.now()-startedAt)/60000));const records=await saveWorkout(routine.id,entries,mins);alert(records?`Treino finalizado! Você bateu ${records} novo(s) recorde(s). 🏆`:'Treino finalizado e salvo!');router.replace('/historico');}
  return <>
    <div className="section-head"><button className="text-btn" onClick={()=>router.back()}>← Voltar</button><span className="badge">{index+1}/{routine.exercises.length}</span></div>
    <div className="exercise-header"><h1 style={{margin:'8px 0 4px'}}>{ex.name}</h1><p style={{margin:0,color:'var(--muted)'}}>{ex.muscle}{ex.machine?` • ${ex.machine}`:''}</p><div className="machine-art"><DumbbellIcon size={80}/></div><div className="previous-box">Último recorde: <strong>{previousBest||'—'} {previousBest?'kg':''}</strong></div></div>
    <div>{entries[ex.id].map((s,i)=><div className="set-row" key={i}><div className="set-label">Série {i+1}</div><div className="set-field"><label>Carga (kg)</label><input type="number" step="0.5" value={s.load} onChange={e=>setVal(i,'load',Number(e.target.value))}/></div><div className="set-field"><label>Reps</label><input type="number" value={s.reps} onChange={e=>setVal(i,'reps',Number(e.target.value))}/></div><button className={finished[`${ex.id}-${i}`]?'set-check done':'set-check'} onClick={()=>setFinished({...finished,[`${ex.id}-${i}`]:!finished[`${ex.id}-${i}`]})}><CheckIcon/></button></div>)}</div>
    {record&&<div className="record-card"><div className="record-trophy">🏆</div><div><h3>Novo recorde!</h3><strong>{previousBest} kg → {currentBest} kg</strong><div className="green">+{(((currentBest-previousBest)/previousBest)*100).toFixed(1).replace('.',',')}%</div></div></div>}
    <div className="grid-2 section"><button className="ghost-btn" disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}>Anterior</button>{index<routine.exercises.length-1?<button className="secondary-btn" onClick={()=>setIndex(index+1)}>Próximo exercício</button>:<button className="primary-btn" onClick={finish}><TrophyIcon/>Finalizar treino</button>}</div>
  </>
}
