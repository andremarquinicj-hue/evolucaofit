export type SetEntry = { load: number; reps: number };
export type Exercise = {
  id: string;
  name: string;
  machine?: string;
  muscle: string;
  defaultSets: number;
  defaultReps: number;
  defaultLoad: number;
  favorite?: boolean;
};
export type RoutineDay = {
  id: string;
  short: string;
  label: string;
  title: string;
  rest?: boolean;
  exercises: Exercise[];
};
export type WorkoutExerciseLog = {
  exerciseId: string;
  name: string;
  sets: SetEntry[];
  previousBest: number;
  bestLoad: number;
};
export type WorkoutSession = {
  id: string;
  date: string;
  routineId: string;
  title: string;
  durationMin: number;
  exercises: WorkoutExerciseLog[];
  records: number;
};
export type Measurement = {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
  arm?: number;
  abdomen?: number;
};
export type ProgressPhoto = { id: string; date: string; url: string };
export type Profile = { name: string; goal: string; weeklyGoal: number };
export type AppState = {
  profile: Profile;
  routines: RoutineDay[];
  sessions: WorkoutSession[];
  measurements: Measurement[];
  photos: ProgressPhoto[];
};
