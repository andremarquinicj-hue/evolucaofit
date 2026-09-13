'use client';
import Link from 'next/link';
import { CalendarIcon, ChartIcon, DumbbellIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';

function dateWeekdayId(){const ids=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];return ids[new Date().getDay()]}
export default function Inicio(){
  const {state}=useApp();
  const todayId=dateWeekdayId();
  const routine=state.routines.find(r=>r.id===todayId) || state.routines[0];
  const latest=state.sessions[0];
  const recentMonth=state.sessions.filter(s=>Date.now()-new Date(`${s.date}T12:00:00`).getTime()<30*864e5);
  const recordCount=recentMonth.reduce((n,s)=>n+s.records,0);
  const weekDone=new Set(state.sessions.filter(s=>Date.now()-new Date(`${s.date}T12:00:00`).getTime()<7*864e5).map(s=>s.routineId));
  const best=Math.max(0,...state.sessions.flatMap(s=>s.exercises.map(e=>e.bestLoad)));
  return <>
    <header className="topbar"><div><h1>Bom dia, {state.profile.name.split(' ')[0]} ❤️</h1><p>Que tal fazer hoje um pouco mais pelo seu grande objetivo?</p></div><div className="avatar">{state.profile.name.slice(0,1).toUpperCase()}</div></header>
    <section className="hero-card card"><div className="hero-content"><span className="eyebrow">Treino de hoje</span><h2>{routine.title}</h2><p>{routine.label}-feira</p><div className="hero-meta"><span>🏋️ {routine.exercises.length} exercícios</span><span>🗓 Último treino: {latest?new Date(`${latest.date}T12:00:00`).toLocaleDateString('pt-BR'):'—'}</span></div>{routine.rest?<Link className="primary-btn" href="/treinos">Ver minha semana</Link>:<Link className="primary-btn" href={`/treino?dia=${routine.id}`}>Iniciar treino →</Link>}</div></section>
    <section className="section grid-2">
      <div className="card stat-card"><div className="stat-icon"><ChartIcon/></div><strong>{recordCount}</strong><span>cargas aumentadas este mês</span></div>
      <div className="card stat-card"><div className="stat-icon"><CalendarIcon/></div><strong>{weekDone.size}</strong><span>treinos nos últimos 7 dias</span></div>
      <div className="card stat-card"><div className="stat-icon"><TrophyIcon/></div><strong>{best} kg</strong><span>maior carga registrada</span></div>
      <div className="card stat-card"><div className="stat-icon"><DumbbellIcon/></div><strong>{state.profile.weeklyGoal}x</strong><span>meta de treinos por semana</span></div>
    </section>
    <section className="section"><div className="section-head"><div><h2>Minha semana</h2><p style={{margin:'4px 0 0',fontSize:12,color:'var(--muted)'}}>{weekDone.size}/{state.profile.weeklyGoal} treinos concluídos</p></div><Link href="/treinos">Organizar</Link></div><div className="week-row">{state.routines.map(r=><div className={`day-dot ${weekDone.has(r.id)?'done':''} ${r.id===todayId?'today':''}`} key={r.id}><i>{weekDone.has(r.id)?'✓':r.short.slice(0,1)}</i>{r.short}</div>)}</div></section>
    <div className="section card quote">“Disciplina é o que te aproxima dos seus sonhos.” ♡</div>
  </>
}
