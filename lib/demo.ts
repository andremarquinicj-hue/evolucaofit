import type { AppState, RoutineDay, WorkoutSession } from './types';

const routines: RoutineDay[] = [
  {
    id: 'segunda', short: 'Seg', label: 'Segunda', title: 'Pernas + Glúteos', exercises: [
      { id: 'agachamento-smith', name: 'Agachamento Smith', machine: 'Smith', muscle: 'Pernas e glúteos', defaultSets: 4, defaultReps: 10, defaultLoad: 45 },
      { id: 'leg-press', name: 'Leg Press', machine: 'Leg Press 45°', muscle: 'Pernas e glúteos', defaultSets: 4, defaultReps: 10, defaultLoad: 85, favorite: true },
      { id: 'cadeira-extensora', name: 'Cadeira Extensora', machine: 'Extensora', muscle: 'Quadríceps', defaultSets: 4, defaultReps: 12, defaultLoad: 35 },
      { id: 'mesa-flexora', name: 'Mesa Flexora', machine: 'Flexora', muscle: 'Posterior', defaultSets: 4, defaultReps: 12, defaultLoad: 30 },
      { id: 'elevacao-pelvica', name: 'Elevação Pélvica', machine: 'Banco + barra', muscle: 'Glúteos', defaultSets: 4, defaultReps: 10, defaultLoad: 60 },
      { id: 'abdutora', name: 'Cadeira Abdutora', machine: 'Abdutora', muscle: 'Glúteos', defaultSets: 3, defaultReps: 15, defaultLoad: 45 },
      { id: 'panturrilha', name: 'Panturrilha', machine: 'Panturrilha sentada', muscle: 'Panturrilhas', defaultSets: 4, defaultReps: 15, defaultLoad: 30 },
    ]
  },
  { id: 'terca', short: 'Ter', label: 'Terça', title: 'Costas + Bíceps', exercises: [
    { id: 'puxada', name: 'Puxada Frontal', machine: 'Pulley', muscle: 'Costas', defaultSets: 4, defaultReps: 10, defaultLoad: 35 },
    { id: 'remada', name: 'Remada Baixa', machine: 'Remada', muscle: 'Costas', defaultSets: 4, defaultReps: 10, defaultLoad: 30 },
    { id: 'rosca', name: 'Rosca Direta', machine: 'Barra', muscle: 'Bíceps', defaultSets: 3, defaultReps: 12, defaultLoad: 12 },
  ] },
  { id: 'quarta', short: 'Qua', label: 'Quarta', title: 'Descanso', rest: true, exercises: [] },
  { id: 'quinta', short: 'Qui', label: 'Quinta', title: 'Posterior + Glúteos', exercises: [
    { id: 'stiff', name: 'Stiff', machine: 'Barra', muscle: 'Posterior', defaultSets: 4, defaultReps: 10, defaultLoad: 35 },
    { id: 'flexora-unilateral', name: 'Flexora Unilateral', machine: 'Flexora', muscle: 'Posterior', defaultSets: 3, defaultReps: 12, defaultLoad: 18 },
    { id: 'coice', name: 'Coice no Cabo', machine: 'Crossover', muscle: 'Glúteos', defaultSets: 3, defaultReps: 12, defaultLoad: 12 },
  ] },
  { id: 'sexta', short: 'Sex', label: 'Sexta', title: 'Superior', exercises: [
    { id: 'supino', name: 'Supino Máquina', machine: 'Chest Press', muscle: 'Peito', defaultSets: 3, defaultReps: 10, defaultLoad: 25 },
    { id: 'desenvolvimento', name: 'Desenvolvimento', machine: 'Máquina', muscle: 'Ombros', defaultSets: 3, defaultReps: 10, defaultLoad: 20 },
    { id: 'triceps', name: 'Tríceps Corda', machine: 'Pulley', muscle: 'Tríceps', defaultSets: 3, defaultReps: 12, defaultLoad: 22 },
  ] },
  { id: 'sabado', short: 'Sáb', label: 'Sábado', title: 'Cardio', exercises: [
    { id: 'esteira', name: 'Esteira', machine: 'Esteira', muscle: 'Cardio', defaultSets: 1, defaultReps: 30, defaultLoad: 0 },
  ] },
  { id: 'domingo', short: 'Dom', label: 'Domingo', title: 'Descanso', rest: true, exercises: [] },
];

function session(id: string, date: string, load: number, title = 'Pernas + Glúteos'): WorkoutSession {
  return {
    id, date, routineId: 'segunda', title, durationMin: 52,
    records: load >= 80 ? 1 : 0,
    exercises: [
      { exerciseId: 'leg-press', name: 'Leg Press', previousBest: Math.max(0, load - 5), bestLoad: load, sets: [{ load, reps: 10 }, { load, reps: 10 }, { load, reps: 10 }] },
      { exerciseId: 'agachamento-smith', name: 'Agachamento Smith', previousBest: 40, bestLoad: 45, sets: [{ load: 45, reps: 10 }, { load: 45, reps: 10 }] },
    ]
  };
}

export const demoState: AppState = {
  profile: { name: 'Amor', goal: 'Ficar mais forte a cada treino', weeklyGoal: 4 },
  routines,
  sessions: [
    session('s1', '2026-08-01', 40),
    session('s2', '2026-08-08', 45),
    session('s3', '2026-08-15', 50),
    session('s4', '2026-08-22', 55),
    session('s5', '2026-08-29', 60),
    session('s6', '2026-09-05', 80),
    session('s7', '2026-09-12', 85),
    {
      id: 's8', date: '2026-09-10', routineId: 'terca', title: 'Costas + Bíceps', durationMin: 48, records: 1,
      exercises: [{ exerciseId: 'puxada', name: 'Puxada Frontal', previousBest: 30, bestLoad: 35, sets: [{load:35,reps:10},{load:35,reps:10}]}]
    },
    {
      id: 's9', date: '2026-09-08', routineId: 'sabado', title: 'Cardio', durationMin: 35, records: 0,
      exercises: [{ exerciseId: 'esteira', name: 'Esteira', previousBest: 0, bestLoad: 0, sets: [{load:0,reps:30}]}]
    }
  ],
  measurements: [
    { id: 'm1', date: '2026-07-01', weight: 66.5, waist: 72, hip: 96, thigh: 56 },
    { id: 'm2', date: '2026-08-01', weight: 64.8, waist: 70, hip: 97, thigh: 57 },
    { id: 'm3', date: '2026-09-12', weight: 62, waist: 68, hip: 98, thigh: 58 },
  ],
  photos: []
};
