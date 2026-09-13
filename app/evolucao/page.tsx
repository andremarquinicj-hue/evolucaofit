'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChartIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';

function linePoints(values: number[], width = 320, height = 150) {
  if (!values.length) return '';
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / (max - min || 1)) * (height - 30) - 15;
    return `${x},${y}`;
  }).join(' ');
}

export default function Evolucao() {
  const { state } = useApp();
  const exercises = useMemo(() => {
    const map = new Map<string, string>();
    state.routines.forEach((routine) => routine.exercises.forEach((exercise) => map.set(exercise.id, exercise.name)));
    return [...map.entries()];
  }, [state.routines]);

  const [selected, setSelected] = useState(exercises[0]?.[0] || '');
  const activeSelected = exercises.some(([id]) => id === selected) ? selected : exercises[0]?.[0] || '';
  const history = useMemo(() =>
    state.sessions
      .slice()
      .reverse()
      .flatMap((session) => session.exercises
        .filter((exercise) => exercise.exerciseId === activeSelected)
        .map((exercise) => ({ date: session.date, load: exercise.bestLoad })))
      .filter((item) => item.load > 0),
  [state.sessions, activeSelected]);

  const values = history.map((item) => item.load);
  const initial = values[0] || 0;
  const current = values.at(-1) || 0;
  const best = Math.max(0, ...values);
  const growth = initial ? ((current - initial) / initial) * 100 : 0;
  const points = linePoints(values);
  const latestMeasurement = state.measurements.at(-1);
  const firstMeasurement = state.measurements[0];

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Evolução</h1>
          <p>Acompanhe seus resultados treino após treino.</p>
        </div>
        <div className="routine-icon"><ChartIcon /></div>
      </header>

      <div className="tabs">
        <button className="tab active">Carga</button>
        <button className="tab">Medidas</button>
        <button className="tab">Peso</button>
        <button className="tab">Fotos</button>
      </div>

      {exercises.length === 0 ? (
        <div className="card empty setup-empty">
          <div className="empty-icon">📈</div>
          <strong>Sua evolução começa no primeiro treino</strong>
          <span>Cadastre sua rotina e, a cada treino concluído, os gráficos de carga serão montados automaticamente.</span>
          <Link className="secondary-btn compact" href="/treinos">Montar meus treinos</Link>
        </div>
      ) : (
        <section className="card chart-card">
          <select className="select-big" value={activeSelected} onChange={(event) => setSelected(event.target.value)}>
            {exercises.map(([id, name]) => <option value={id} key={id}>{name}</option>)}
          </select>

          {history.length === 0 ? (
            <div className="empty evolution-empty">
              <strong>Ainda não há histórico deste exercício.</strong>
              <span>Finalize o primeiro treino para criar a linha de evolução.</span>
            </div>
          ) : (
            <div className="chart">
              <div className="chart-grid"><span /><span /><span /><span /></div>
              <svg viewBox="0 0 320 165" preserveAspectRatio="none">
                <polyline points={points} fill="none" stroke="#9d60b3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="chart-labels">
                <span>{new Date(`${history[0].date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                <span>{new Date(`${history.at(-1)!.date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          )}

          <div className="metric-grid">
            <div className="metric"><span>Carga inicial</span><strong>{initial > 0 ? `${initial} kg` : '—'}</strong></div>
            <div className="metric"><span>Carga atual</span><strong>{current > 0 ? `${current} kg` : '—'}</strong></div>
            <div className="metric"><span>Evolução</span><strong className="green">{initial > 0 ? `${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%` : '—'}</strong></div>
            <div className="metric"><span>Maior carga</span><strong>{best > 0 ? `${best} kg` : '—'}</strong></div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head"><h2>Meu corpo</h2><span className="badge">Última medição</span></div>
        <div className="grid-2">
          <div className="card stat-card">
            <div className="stat-icon"><ChartIcon /></div>
            <strong>{latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '—'}</strong>
            <span>
              Peso atual {firstMeasurement?.weight && latestMeasurement?.weight
                ? `(${(latestMeasurement.weight - firstMeasurement.weight).toFixed(1)} kg desde o início)`
                : ''}
            </span>
          </div>
          <div className="card stat-card">
            <div className="stat-icon"><TrophyIcon /></div>
            <strong>{latestMeasurement?.thigh ? `${latestMeasurement.thigh} cm` : '—'}</strong>
            <span>Medida de coxa registrada</span>
          </div>
        </div>
      </section>
    </>
  );
}
