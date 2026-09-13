'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckIcon, ClockIcon, DumbbellIcon, TrophyIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';
import type { SetEntry } from '@/lib/types';

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Treino() {
  const { state, saveWorkout } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const requestedId = params.get('dia') || 'segunda';
  const routine = state.routines.find((item) => item.id === requestedId) || state.routines.find((item) => !item.rest && item.exercises.length > 0);

  const [index, setIndex] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState<Record<string, boolean>>({});
  const [restPreset, setRestPreset] = useState(60);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerInitial, setTimerInitial] = useState(60);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  const [entries, setEntries] = useState<Record<string, SetEntry[]>>(() =>
    Object.fromEntries(
      (routine?.exercises || []).map((exercise) => [
        exercise.id,
        Array.from({ length: exercise.defaultSets }, () => ({
          load: exercise.defaultLoad,
          reps: exercise.defaultReps,
        })),
      ]),
    ),
  );

  const exercise = routine?.exercises[index];
  const exerciseEntries = exercise ? entries[exercise.id] || [] : [];

  const previousLog = useMemo(() => {
    if (!exercise) return undefined;
    return state.sessions
      .filter((session) => session.routineId === routine?.id)
      .flatMap((session) => session.exercises)
      .find((item) => item.exerciseId === exercise.id);
  }, [state.sessions, exercise, routine?.id]);

  const previousBest = useMemo(() => {
    if (!exercise) return 0;
    return Math.max(
      0,
      ...state.sessions.flatMap((session) =>
        session.exercises
          .filter((item) => item.exerciseId === exercise.id)
          .map((item) => item.bestLoad),
      ),
    );
  }, [state.sessions, exercise]);

  useEffect(() => {
    if (!timerOpen || !timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([160, 80, 160]);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerOpen, timerRunning]);

  if (!routine || !exercise) {
    return (
      <div className="card empty setup-empty">
        <div className="empty-icon">🏋️</div>
        <strong>Este treino ainda não tem exercícios.</strong>
        <span>Monte o treino deste dia antes de começar.</span>
        <button className="secondary-btn compact" type="button" onClick={() => router.replace(`/treinos?dia=${requestedId}`)}>
          Montar treino
        </button>
      </div>
    );
  }

  // Keep stable, non-optional references for callbacks below.
  // TypeScript does not preserve the earlier null check inside nested functions.
  const activeRoutine = routine;
  const activeExercise = exercise;

  const currentBest = Math.max(0, ...exerciseEntries.map((set) => Number(set.load) || 0));
  const record = currentBest > previousBest && previousBest > 0;
  const increasedFromCurrent = currentBest > Number(activeExercise.defaultLoad || 0);
  const completedSets = exerciseEntries.filter((_, setIndex) => finished[`${activeExercise.id}-${setIndex}`]).length;
  const allSets = activeRoutine.exercises.reduce((total, item) => total + item.defaultSets, 0);
  const totalCompleted = Object.values(finished).filter(Boolean).length;

  function setValue(setIndex: number, key: 'load' | 'reps', value: number) {
    setEntries((previous) => ({
      ...previous,
      [activeExercise.id]: (previous[activeExercise.id] || []).map((set, position) =>
        position === setIndex ? { ...set, [key]: Math.max(0, value) } : set,
      ),
    }));
  }

  function startRest(seconds = restPreset) {
    setRestPreset(seconds);
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setTimerOpen(true);
    setTimerRunning(true);
  }

  function toggleSet(setIndex: number) {
    const key = `${activeExercise.id}-${setIndex}`;
    const wasFinished = Boolean(finished[key]);
    setFinished((previous) => ({ ...previous, [key]: !wasFinished }));
    if (!wasFinished) startRest(restPreset);
  }

  async function finishWorkout() {
    if (totalCompleted < allSets) {
      const continueAnyway = window.confirm(
        `Você marcou ${totalCompleted} de ${allSets} séries como concluídas. Deseja finalizar mesmo assim?`,
      );
      if (!continueAnyway) return;
    }
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const records = await saveWorkout(activeRoutine.id, entries, minutes);
    window.alert(
      records
        ? `Treino finalizado! Você bateu ${records} novo(s) recorde(s). 🏆`
        : 'Treino finalizado e salvo! A carga usada hoje ficará preparada para o próximo treino.',
    );
    router.replace('/historico');
  }

  return (
    <>
      <div className="workout-top">
        <button className="text-btn" type="button" onClick={() => router.back()}>← Sair</button>
        <div className="workout-progress-copy">
          <strong>{activeRoutine.title}</strong>
          <span>{totalCompleted}/{allSets} séries concluídas</span>
        </div>
        <span className="badge">{index + 1}/{activeRoutine.exercises.length}</span>
      </div>
      <div className="workout-progress-bar"><span style={{ width: `${((index + 1) / activeRoutine.exercises.length) * 100}%` }} /></div>

      <div className="exercise-header">
        <span className="eyebrow">EXERCÍCIO {index + 1}</span>
        <h1>{activeExercise.name}</h1>
        <p>{activeExercise.muscle}{activeExercise.machine ? ` • ${activeExercise.machine}` : ''}</p>
        <div className="machine-art"><DumbbellIcon size={80} /></div>

        <div className="load-summary-grid">
          <div className="load-summary current">
            <span>Carga atual</span>
            <strong>{activeExercise.defaultLoad > 0 ? `${activeExercise.defaultLoad} kg` : '—'}</strong>
            <small>Valor sugerido para começar hoje</small>
          </div>
          <div className="load-summary">
            <span>Maior carga</span>
            <strong>{previousBest > 0 ? `${previousBest} kg` : '—'}</strong>
            <small>{previousLog ? 'Seu histórico neste exercício' : 'Primeiro registro'}</small>
          </div>
        </div>

        {previousLog && (
          <div className="previous-box">
            Último treino: <strong>{previousLog.bestLoad} kg</strong>
            {' • '}
            {previousLog.sets.length} séries registradas
          </div>
        )}
      </div>

      <div className="workout-set-heading">
        <div>
          <h3>Séries</h3>
          <span>{completedSets}/{exerciseEntries.length} concluídas</span>
        </div>
        <button className="rest-button" type="button" onClick={() => startRest(restPreset)}>
          <ClockIcon size={18} /> Descanso {restPreset}s
        </button>
      </div>

      <div>
        {exerciseEntries.map((set, setIndex) => (
          <div className={`set-row ${finished[`${activeExercise.id}-${setIndex}`] ? 'completed' : ''}`} key={setIndex}>
            <div className="set-label">Série {setIndex + 1}</div>
            <div className="set-field">
              <label>Carga (kg)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={set.load}
                onChange={(event) => setValue(setIndex, 'load', Number(event.target.value))}
              />
            </div>
            <div className="set-field">
              <label>Reps</label>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={set.reps}
                onChange={(event) => setValue(setIndex, 'reps', Number(event.target.value))}
              />
            </div>
            <button
              className={finished[`${activeExercise.id}-${setIndex}`] ? 'set-check done' : 'set-check'}
              type="button"
              aria-label={`Concluir série ${setIndex + 1}`}
              onClick={() => toggleSet(setIndex)}
            >
              <CheckIcon />
            </button>
          </div>
        ))}
      </div>

      {increasedFromCurrent && (
        <div className="load-increase-card">
          <span>📈</span>
          <div>
            <strong>Você aumentou a carga neste treino</strong>
            <small>{activeExercise.defaultLoad} kg → {currentBest} kg. Ao finalizar, esta será a referência para a próxima vez.</small>
          </div>
        </div>
      )}

      {record && (
        <div className="record-card">
          <div className="record-trophy">🏆</div>
          <div>
            <h3>Novo recorde!</h3>
            <strong>{previousBest} kg → {currentBest} kg</strong>
            <div className="green">+{(((currentBest - previousBest) / previousBest) * 100).toFixed(1).replace('.', ',')}%</div>
          </div>
        </div>
      )}

      <div className="workout-actions section">
        <button className="ghost-btn" disabled={index === 0} onClick={() => setIndex(Math.max(0, index - 1))}>
          Anterior
        </button>
        {index < activeRoutine.exercises.length - 1 ? (
          <button className="secondary-btn" onClick={() => setIndex(index + 1)}>
            Próximo exercício
          </button>
        ) : (
          <button className="primary-btn" onClick={finishWorkout}>
            <TrophyIcon /> Finalizar treino
          </button>
        )}
      </div>

      {timerOpen && (
        <div className="timer-backdrop" onClick={() => setTimerOpen(false)}>
          <div className="timer-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="timer-handle" />
            <div className="timer-title-row">
              <div>
                <span className="eyebrow">CRONÔMETRO DE DESCANSO</span>
                <h2>{timerSeconds === 0 ? 'Descanso concluído! 💪' : 'Respire e recupere'}</h2>
              </div>
              <button className="text-btn" type="button" onClick={() => setTimerOpen(false)}>Fechar</button>
            </div>

            <div className={`timer-clock ${timerSeconds === 0 ? 'done' : ''}`}>
              <ClockIcon size={30} />
              <strong>{formatTimer(timerSeconds)}</strong>
              <span>{timerRunning ? 'contando...' : timerSeconds === 0 ? 'hora da próxima série' : 'pausado'}</span>
            </div>

            <div className="timer-presets">
              {[30, 45, 60, 90, 120].map((seconds) => (
                <button
                  type="button"
                  key={seconds}
                  className={timerInitial === seconds ? 'active' : ''}
                  onClick={() => startRest(seconds)}
                >
                  {seconds < 60 ? `${seconds}s` : seconds === 60 ? '1 min' : seconds === 90 ? '1:30' : '2 min'}
                </button>
              ))}
            </div>

            <div className="timer-actions">
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  if (timerSeconds === 0) {
                    setTimerSeconds(timerInitial);
                    setTimerRunning(true);
                  } else {
                    setTimerRunning((current) => !current);
                  }
                }}
              >
                {timerSeconds === 0 ? 'Reiniciar' : timerRunning ? 'Pausar' : 'Continuar'}
              </button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => {
                  setTimerSeconds((current) => current + 15);
                  setTimerRunning(true);
                }}
              >
                +15 segundos
              </button>
            </div>

            <p className="timer-tip">
              Ao marcar uma série como concluída, o cronômetro abre automaticamente. Você pode trocar o tempo entre 30 segundos e 2 minutos.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
