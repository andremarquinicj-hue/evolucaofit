'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronIcon, DumbbellIcon, EditIcon, PlusIcon } from '@/components/icons';
import { useApp } from '@/lib/app-context';
import type { Exercise, RoutineDay } from '@/lib/types';

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EMPTY_ROUTINE: RoutineDay = {
  id: 'segunda',
  short: 'Seg',
  label: 'Segunda',
  title: 'Novo treino',
  rest: false,
  exercises: [],
};

function cloneRoutine(routine: RoutineDay): RoutineDay {
  return JSON.parse(JSON.stringify(routine)) as RoutineDay;
}

export default function Treinos() {
  const { state, updateRoutine } = useApp();

  const [selectedId, setSelectedId] = useState(
    () => state.routines.find((routine) => !routine.rest)?.id ?? state.routines[0]?.id ?? 'segunda',
  );

  const selected = useMemo<RoutineDay>(
    () => state.routines.find((routine) => routine.id === selectedId) ?? state.routines[0] ?? EMPTY_ROUTINE,
    [state.routines, selectedId],
  );

  const [draft, setDraft] = useState<RoutineDay>(() => cloneRoutine(selected));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setDraft(cloneRoutine(selected));
    setEditingId(null);
  }, [selected]);

  const editExercise = (id: string, patch: Partial<Exercise>) => {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, ...patch } : exercise,
      ),
    }));
  };

  async function saveExercise() {
    await updateRoutine(draft);
    setEditingId(null);
  }

  async function removeExercise(id: string) {
    const next: RoutineDay = {
      ...draft,
      exercises: draft.exercises.filter((exercise) => exercise.id !== id),
    };
    setDraft(next);
    await updateRoutine(next);
  }

  async function addExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();

    if (!name) return;

    const exercise: Exercise = {
      id: `${slug(name) || 'exercicio'}-${Date.now()}`,
      name,
      machine: String(data.get('machine') ?? '').trim(),
      muscle: String(data.get('muscle') ?? 'Geral').trim() || 'Geral',
      defaultSets: Math.max(1, Number(data.get('sets') ?? 3)),
      defaultReps: Math.max(1, Number(data.get('reps') ?? 10)),
      defaultLoad: Math.max(0, Number(data.get('load') ?? 0)),
    };

    const next: RoutineDay = {
      ...draft,
      rest: false,
      title: draft.title === 'Descanso' ? 'Novo treino' : draft.title,
      exercises: [...draft.exercises, exercise],
    };

    setDraft(next);
    await updateRoutine(next);
    form.reset();
    setShowAdd(false);
  }

  async function saveTitle() {
    await updateRoutine(draft);
  }

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Meus treinos</h1>
          <p>Organize, execute e conquiste seus objetivos.</p>
        </div>
        <div className="routine-icon">
          <DumbbellIcon />
        </div>
      </header>

      <div className="tabs">
        <button className="tab active" type="button">Semana</button>
        <button className="tab" type="button">Exercícios</button>
        <button className="tab" type="button">Favoritos</button>
      </div>

      <div className="routine-list">
        {state.routines.map((routine) => (
          <button
            type="button"
            key={routine.id}
            onClick={() => setSelectedId(routine.id)}
            className={`routine-row ${selectedId === routine.id ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <div className="routine-icon">{routine.rest ? '♡' : '🏋️'}</div>
            <div>
              <strong>{routine.label}</strong>
              <span>{routine.title}</span>
            </div>
            <ChevronIcon size={18} />
          </button>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>{draft.label}</h2>
          {!draft.rest && (
            <Link className="badge" href={`/treino?dia=${draft.id}`}>
              Iniciar treino →
            </Link>
          )}
        </div>

        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="field">
            <label>NOME DO TREINO</label>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                  rest: false,
                }))
              }
              onBlur={saveTitle}
            />
          </div>
        </div>

        <div className="section-head">
          <h3>Exercícios ({draft.exercises.length})</h3>
          <button className="text-btn" type="button" onClick={() => setShowAdd(true)}>
            + Adicionar
          </button>
        </div>

        <div className="exercise-list">
          {draft.exercises.length === 0 ? (
            <div className="card empty">
              Nenhum exercício neste dia. Toque em “Adicionar” para montar o treino.
            </div>
          ) : (
            draft.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`exercise-card ${editingId === exercise.id ? 'selected' : ''}`}
              >
                <div className="exercise-thumb">
                  <DumbbellIcon />
                </div>

                <div>
                  <strong>{exercise.name}</strong>
                  <p>
                    {exercise.defaultSets} séries × {exercise.defaultReps} repetições •{' '}
                    {exercise.defaultLoad} kg
                  </p>
                  {exercise.machine && <p>{exercise.machine}</p>}
                </div>

                <button
                  className="text-btn"
                  type="button"
                  aria-label={`Editar ${exercise.name}`}
                  onClick={() => setEditingId(editingId === exercise.id ? null : exercise.id)}
                >
                  <EditIcon size={19} />
                </button>

                {editingId === exercise.id && (
                  <div className="exercise-details">
                    <div className="form-grid">
                      <div className="field">
                        <label>EXERCÍCIO</label>
                        <input
                          value={exercise.name}
                          onChange={(event) => editExercise(exercise.id, { name: event.target.value })}
                        />
                      </div>

                      <div className="field">
                        <label>APARELHO</label>
                        <input
                          value={exercise.machine ?? ''}
                          onChange={(event) => editExercise(exercise.id, { machine: event.target.value })}
                        />
                      </div>

                      <div className="field">
                        <label>SÉRIES</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.defaultSets}
                          onChange={(event) =>
                            editExercise(exercise.id, {
                              defaultSets: Math.max(1, Number(event.target.value)),
                            })
                          }
                        />
                      </div>

                      <div className="field">
                        <label>REPETIÇÕES</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.defaultReps}
                          onChange={(event) =>
                            editExercise(exercise.id, {
                              defaultReps: Math.max(1, Number(event.target.value)),
                            })
                          }
                        />
                      </div>

                      <div className="field">
                        <label>CARGA (KG)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.defaultLoad}
                          onChange={(event) =>
                            editExercise(exercise.id, {
                              defaultLoad: Math.max(0, Number(event.target.value)),
                            })
                          }
                        />
                      </div>

                      <div className="field">
                        <label>GRUPO MUSCULAR</label>
                        <input
                          value={exercise.muscle}
                          onChange={(event) => editExercise(exercise.id, { muscle: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="inline-actions">
                      <button
                        className="ghost-btn compact danger"
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        Excluir
                      </button>
                      <button
                        className="secondary-btn compact"
                        type="button"
                        onClick={saveExercise}
                      >
                        Salvar alterações
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="section-head">
              <h2>Novo exercício</h2>
              <button className="text-btn" type="button" onClick={() => setShowAdd(false)}>
                Fechar
              </button>
            </div>

            <form onSubmit={addExercise}>
              <div className="field">
                <label>EXERCÍCIO</label>
                <input name="name" placeholder="Ex.: Leg Press" required />
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>APARELHO</label>
                <input name="machine" placeholder="Ex.: Leg Press 45°" />
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>GRUPO MUSCULAR</label>
                <input name="muscle" placeholder="Ex.: Pernas e glúteos" />
              </div>

              <div className="form-grid" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>SÉRIES</label>
                  <input name="sets" type="number" min="1" defaultValue="4" />
                </div>
                <div className="field">
                  <label>REPS</label>
                  <input name="reps" type="number" min="1" defaultValue="10" />
                </div>
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>CARGA INICIAL (KG)</label>
                <input name="load" type="number" min="0" step="0.5" defaultValue="0" />
              </div>

              <button className="primary-btn full" style={{ marginTop: 16 }}>
                <PlusIcon />
                Adicionar exercício
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
