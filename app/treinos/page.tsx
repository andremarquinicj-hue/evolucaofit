'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronIcon, DumbbellIcon, EditIcon, PlusIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';
import type { Exercise, RoutineDay } from '@/lib/types';

const slug=(v:string)=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export default function Treinos(){
  const {state,updateRoutine}=useApp();
  const [selectedId,setSelectedId]=useState(state.routines.find(r=>!r.rest)?.id||'segunda');
  const [draft,setDraft]=useState<RoutineDay|undefined>();
  const [editingId,setEditingId]=useState<string|null>(null);
  const [showAdd,setShowAdd]=useState(false);
  const selected=useMemo(()=>state.routines.find(r=>r.id===selectedId)||state.routines[0],[state.routines,selectedId]);
  useEffect(()=>{setDraft(JSON.parse(JSON.stringify(selected)));setEditingId(null)},[selected]);
  if(!draft) return null;
  const editExercise=(id:string, patch:Partial<Exercise>)=>setDraft({...draft,exercises:draft.exercises.map(e=>e.id===id?{...e,...patch}:e)});
  async function saveExercise(){await updateRoutine(draft);setEditingId(null)}
  async function removeExercise(id:string){const next={...draft,exercises:draft.exercises.filter(e=>e.id!==id)};setDraft(next);await updateRoutine(next);}
  async function addExercise(e:FormEvent<HTMLFormElement>){e.preventDefault();const fd=new FormData(e.currentTarget);const name=String(fd.get('name')||'');const ex:Exercise={id:`${slug(name)}-${Date.now()}`,name,machine:String(fd.get('machine')||''),muscle:String(fd.get('muscle')||'Geral'),defaultSets:Number(fd.get('sets')||3),defaultReps:Number(fd.get('reps')||10),defaultLoad:Number(fd.get('load')||0)};const next={...draft,exercises:[...draft.exercises,ex],rest:false,title:draft.title==='Descanso'?'Novo treino':draft.title};setDraft(next);await updateRoutine(next);setShowAdd(false);}
  async function saveTitle(){await updateRoutine(draft)}
  return <>
    <header className="topbar"><div><h1>Meus treinos</h1><p>Organize, execute e conquiste seus objetivos.</p></div><div className="routine-icon"><DumbbellIcon/></div></header>
    <div className="tabs"><button className="tab active">Semana</button><button className="tab">Exercícios</button><button className="tab">Favoritos</button></div>
    <div className="routine-list">{state.routines.map(r=><button type="button" key={r.id} onClick={()=>setSelectedId(r.id)} className={`routine-row ${selectedId===r.id?'active':''}`} style={{width:'100%',textAlign:'left'}}><div className="routine-icon">{r.rest?'♡':'🏋️'}</div><div><strong>{r.label}</strong><span>{r.title}</span></div><ChevronIcon size={18}/></button>)}</div>
    <section className="section"><div className="section-head"><h2>{draft.label}</h2>{!draft.rest&&<Link className="badge" href={`/treino?dia=${draft.id}`}>Iniciar treino →</Link>}</div>
      <div className="card" style={{padding:14,marginBottom:12}}><div className="field"><label>NOME DO TREINO</label><input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value,rest:false})} onBlur={saveTitle}/></div></div>
      <div className="section-head"><h3>Exercícios ({draft.exercises.length})</h3><button className="text-btn" onClick={()=>setShowAdd(true)}>+ Adicionar</button></div>
      <div className="exercise-list">{draft.exercises.length===0?<div className="card empty">Nenhum exercício neste dia. Toque em “Adicionar” para montar o treino.</div>:draft.exercises.map(ex=><div key={ex.id} className={`exercise-card ${editingId===ex.id?'selected':''}`}><div className="exercise-thumb"><DumbbellIcon/></div><div><strong>{ex.name}</strong><p>{ex.defaultSets} séries × {ex.defaultReps} repetições • {ex.defaultLoad} kg</p>{ex.machine&&<p>{ex.machine}</p>}</div><button className="text-btn" onClick={()=>setEditingId(editingId===ex.id?null:ex.id)}><EditIcon size={19}/></button>{editingId===ex.id&&<div className="exercise-details"><div className="form-grid"><div className="field"><label>EXERCÍCIO</label><input value={ex.name} onChange={e=>editExercise(ex.id,{name:e.target.value})}/></div><div className="field"><label>APARELHO</label><input value={ex.machine||''} onChange={e=>editExercise(ex.id,{machine:e.target.value})}/></div><div className="field"><label>SÉRIES</label><input type="number" min="1" value={ex.defaultSets} onChange={e=>editExercise(ex.id,{defaultSets:Number(e.target.value)})}/></div><div className="field"><label>REPETIÇÕES</label><input type="number" min="1" value={ex.defaultReps} onChange={e=>editExercise(ex.id,{defaultReps:Number(e.target.value)})}/></div><div className="field"><label>CARGA (KG)</label><input type="number" min="0" step="0.5" value={ex.defaultLoad} onChange={e=>editExercise(ex.id,{defaultLoad:Number(e.target.value)})}/></div><div className="field"><label>GRUPO MUSCULAR</label><input value={ex.muscle} onChange={e=>editExercise(ex.id,{muscle:e.target.value})}/></div></div><div className="inline-actions"><button className="ghost-btn compact danger" onClick={()=>removeExercise(ex.id)}>Excluir</button><button className="secondary-btn compact" onClick={saveExercise}>Salvar alterações</button></div></div>}</div>)}</div>
    </section>
    {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="section-head"><h2>Novo exercício</h2><button className="text-btn" onClick={()=>setShowAdd(false)}>Fechar</button></div><form onSubmit={addExercise}><div className="field"><label>EXERCÍCIO</label><input name="name" placeholder="Ex.: Leg Press" required/></div><div className="field" style={{marginTop:10}}><label>APARELHO</label><input name="machine" placeholder="Ex.: Leg Press 45°"/></div><div className="field" style={{marginTop:10}}><label>GRUPO MUSCULAR</label><input name="muscle" placeholder="Ex.: Pernas e glúteos"/></div><div className="form-grid" style={{marginTop:10}}><div className="field"><label>SÉRIES</label><input name="sets" type="number" min="1" defaultValue="4"/></div><div className="field"><label>REPS</label><input name="reps" type="number" min="1" defaultValue="10"/></div></div><div className="field" style={{marginTop:10}}><label>CARGA INICIAL (KG)</label><input name="load" type="number" min="0" step="0.5" defaultValue="0"/></div><button className="primary-btn full" style={{marginTop:16}}><PlusIcon/>Adicionar exercício</button></form></div></div>}
  </>
}
