'use client';

import Link from 'next/link';
import { CalendarIcon, ChartIcon, DumbbellIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';

function dateWeekdayId() {
  const ids = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return ids[new Date().getDay()];
}

export default function Inicio() {
  const { state } = useApp();
  const todayId = dateWeekdayId();
  const routine = state.routines.find((item) => item.id === todayId) || state.routines[0];
  const hasRoutine = Boolean(routine && !routine.rest && routine.exercises.length > 0);
  const hasAnyWorkoutPlan = state.routines.some((item) => item.exercises.length > 0);
  const firstName = state.profile.name.split(' ')[0] || 'Atleta';

  const latestForToday = state.sessions.find((session) => session.routineId === todayId);
  const recentMonth = state.sessions.filter((session) =>
    Date.now() - new Date(`${session.date}T12:00:00`).getTime() < 30 * 864e5
  );
  const recordCount = recentMonth.reduce((total, session) => total + session.records, 0);
  const weekDone = new Set(
    state.sessions
      .filter((session) => Date.now() - new Date(`${session.date}T12:00:00`).getTime() < 7 * 864e5)
      .map((session) => session.routineId),
  );
  const best = Math.max(0, ...state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.bestLoad)));

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Bom dia, {firstName} ❤️</h1>
          <p>Que tal fazer hoje um pouco mais pelo seu grande objetivo?</p>
        </div>
        <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
      </header>

      {!hasAnyWorkoutPlan && (
        <section className="onboarding-card card">
          <div className="onboarding-icon">🏋️‍♀️</div>
          <span className="eyebrow">PRIMEIRO ACESSO</span>
          <h2>Vamos montar seu primeiro treino?</h2>
          <p>
            Escolha os dias da semana, cadastre os exercícios, informe séries, repetições e a carga atual.
            A partir daí, o Evolução Fit acompanha tudo automaticamente.
          </p>
          <div className="onboarding-steps">
            <div><i>1</i><span>Escolha o dia</span></div>
            <div><i>2</i><span>Adicione os exercícios</span></div>
            <div><i>3</i><span>Comece a evoluir</span></div>
          </div>
          <Link className="primary-btn full" href={`/treinos?dia=${todayId}`}>
            Montar meu primeiro treino →
          </Link>
        </section>
      )}

      {hasAnyWorkoutPlan && (
        <section className="hero-card card">
          <div className="hero-content">
            <span className="eyebrow">Treino de hoje</span>
            <h2>{hasRoutine ? routine.title : routine?.rest ? 'Dia de descanso' : 'Treino ainda não montado'}</h2>
            <p>{routine?.label}</p>
            <div className="hero-meta">
              <span>🏋️ {routine?.exercises.length ?? 0} exercícios</span>
              <span>
                🗓 Último treino:{' '}
                {latestForToday
                  ? new Date(`${latestForToday.date}T12:00:00`).toLocaleDateString('pt-BR')
                  : 'ainda não realizado'}
              </span>
            </div>
            {hasRoutine ? (
              <Link className="primary-btn" href={`/treino?dia=${routine.id}`}>
                Começar treino →
              </Link>
            ) : (
              <Link className="primary-btn" href={`/treinos?dia=${todayId}`}>
                {routine?.rest ? 'Ver minha semana' : 'Montar treino de hoje'}
              </Link>
            )}
          </div>
        </section>
      )}

      {hasRoutine && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>O que vou treinar hoje</h2>
              <p className="section-subtitle">Sua carga atual já fica pronta para começar.</p>
            </div>
            <Link href={`/treinos?dia=${routine.id}`}>Editar</Link>
          </div>
          <div className="today-exercises">
            {routine.exercises.map((exercise, index) => (
              <div className="today-exercise-card card" key={exercise.id}>
                <div className="today-exercise-index">{index + 1}</div>
                <div className="today-exercise-info">
                  <strong>{exercise.name}</strong>
                  <span>{exercise.machine || exercise.muscle}</span>
                  <small>{exercise.defaultSets} séries × {exercise.defaultReps} reps</small>
                </div>
                <div className="today-load">
                  <span>Carga atual</span>
                  <strong>{exercise.defaultLoad > 0 ? `${exercise.defaultLoad} kg` : 'Definir'}</strong>
                </div>
              </div>
            ))}
          </div>
          <Link className="secondary-btn full today-start-btn" href={`/treino?dia=${routine.id}`}>
            <DumbbellIcon /> Iniciar treino de hoje
          </Link>
        </section>
      )}

      <section className="section grid-2">
        <div className="card stat-card">
          <div className="stat-icon"><ChartIcon /></div>
          <strong>{recordCount}</strong>
          <span>cargas aumentadas este mês</span>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><CalendarIcon /></div>
          <strong>{weekDone.size}</strong>
          <span>treinos nos últimos 7 dias</span>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><TrophyIcon /></div>
          <strong>{best > 0 ? `${best} kg` : '—'}</strong>
          <span>maior carga registrada</span>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><DumbbellIcon /></div>
          <strong>{state.profile.weeklyGoal}x</strong>
          <span>meta de treinos por semana</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Minha semana</h2>
            <p className="section-subtitle">{weekDone.size}/{state.profile.weeklyGoal} treinos concluídos</p>
          </div>
          <Link href="/treinos">Organizar</Link>
        </div>
        <div className="week-row">
          {state.routines.map((item) => (
            <div className={`day-dot ${weekDone.has(item.id) ? 'done' : ''} ${item.id === todayId ? 'today' : ''}`} key={item.id}>
              <i>{weekDone.has(item.id) ? '✓' : item.short.slice(0, 1)}</i>
              {item.short}
            </div>
          ))}
        </div>
      </section>

      <div className="section card quote">“Disciplina é o que te aproxima dos seus sonhos.” ♡</div>
    </>
  );
}
