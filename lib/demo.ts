import type { AppState, RoutineDay } from './types';

const WEEK: Array<Pick<RoutineDay, 'id' | 'short' | 'label'>> = [
  { id: 'segunda', short: 'Seg', label: 'Segunda' },
  { id: 'terca', short: 'Ter', label: 'Terça' },
  { id: 'quarta', short: 'Qua', label: 'Quarta' },
  { id: 'quinta', short: 'Qui', label: 'Quinta' },
  { id: 'sexta', short: 'Sex', label: 'Sexta' },
  { id: 'sabado', short: 'Sáb', label: 'Sábado' },
  { id: 'domingo', short: 'Dom', label: 'Domingo' },
];

export function createEmptyState(name = 'Atleta'): AppState {
  return {
    profile: {
      name,
      goal: 'Evoluir um treino de cada vez',
      weeklyGoal: 4,
    },
    routines: WEEK.map((day) => ({
      ...day,
      title: 'Treino não definido',
      rest: false,
      exercises: [],
    })),
    sessions: [],
    measurements: [],
    photos: [],
  };
}

// Mantido por compatibilidade com versões anteriores do projeto.
// Agora o estado inicial é totalmente zerado: nenhum treino, carga ou medição fictícia.
export const demoState: AppState = createEmptyState();

export function isLegacyDemoState(state: AppState | null | undefined) {
  if (!state) return false;
  const sessionIds = new Set((state.sessions || []).map((session) => session.id));
  const legPress = (state.routines || [])
    .flatMap((routine) => routine.exercises || [])
    .find((exercise) => exercise.id === 'leg-press');

  return (
    sessionIds.has('s1') &&
    sessionIds.has('s7') &&
    Boolean(legPress && Number(legPress.defaultLoad) === 85)
  );
}
