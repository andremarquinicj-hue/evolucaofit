'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, firebaseEnabled, storage } from './firebase';
import { createEmptyState, isLegacyDemoState } from './demo';
import type { AppState, Measurement, RoutineDay, SetEntry } from './types';

const STORAGE_KEY = 'evolucao-fit-state-v1';
const LOCAL_ACCOUNT_KEY = 'evolucao-fit-local-account-v1';
const LOCAL_SESSION_KEY = 'evolucao-fit-local-session-v1';

type LoginResult = { ok: boolean; error?: string };
type LocalAccount = { name: string; email: string; passwordHash: string };

type AppContextValue = {
  state: AppState;
  ready: boolean;
  user: User | null;
  cloudMode: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (name: string, email: string, password: string) => Promise<LoginResult>;
  resetPassword: (email: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateRoutine: (routine: RoutineDay) => Promise<void>;
  saveWorkout: (routineId: string, entries: Record<string, SetEntry[]>, durationMin: number) => Promise<number>;
  addMeasurement: (measurement: Omit<Measurement, 'id'>) => Promise<void>;
  updateProfile: (name: string, goal: string, weeklyGoal: number) => Promise<void>;
  addProgressPhoto: (file: File) => Promise<string>;
  resetData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeState(value: unknown, fallbackName = 'Atleta'): AppState {
  if (!value || typeof value !== 'object') return createEmptyState(fallbackName);
  const candidate = value as AppState;
  if (!Array.isArray(candidate.routines) || !Array.isArray(candidate.sessions)) {
    return createEmptyState(fallbackName);
  }
  return candidate;
}

async function hashPassword(value: string) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return value;
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function cleanError(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  if (text.includes('invalid-credential') || text.includes('wrong-password') || text.includes('user-not-found')) return 'E-mail ou senha inválidos.';
  if (text.includes('email-already-in-use')) return 'Este e-mail já está cadastrado.';
  if (text.includes('weak-password')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (text.includes('invalid-email')) return 'Digite um e-mail válido.';
  if (text.includes('too-many-requests')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (text.includes('network-request-failed')) return 'Sem conexão com a internet. Tente novamente.';
  if (text.includes('user-disabled')) return 'Esta conta está desativada.';
  if (text.includes('operation-not-allowed')) return 'Ative o login por E-mail/Senha no Firebase Authentication.';
  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createEmptyState());
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [localAuthenticated, setLocalAuthenticated] = useState(false);

  const persist = useCallback(async (next: AppState, explicitUser?: User | null) => {
    setState(next);
    const activeUser = explicitUser === undefined ? user : explicitUser;
    if (firebaseEnabled && db && activeUser) {
      const firestoreSafe = JSON.parse(JSON.stringify(next)) as AppState;
      await setDoc(doc(db, 'users', activeUser.uid, 'app', 'main'), firestoreSafe);
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, [user]);

  useEffect(() => {
    if (!firebaseEnabled || !auth || !db) {
      const local = localStorage.getItem(STORAGE_KEY);
      let next = createEmptyState();
      if (local) {
        try {
          const parsed = safeState(JSON.parse(local));
          if (isLegacyDemoState(parsed)) {
            const rawAccount = localStorage.getItem(LOCAL_ACCOUNT_KEY);
            let name = parsed.profile?.name || 'Atleta';
            if (rawAccount) {
              try { name = (JSON.parse(rawAccount) as LocalAccount).name || name; } catch { /* ignora */ }
            }
            next = createEmptyState(name);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } else {
            next = parsed;
          }
        } catch {
          next = createEmptyState();
        }
      }
      setState(next);
      setLocalAuthenticated(localStorage.getItem(LOCAL_SESSION_KEY) === '1');
      setReady(true);
      return;
    }

    const activeAuth = auth;
    const activeDb = db;
    const unsub = onAuthStateChanged(activeAuth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setReady(true);
        return;
      }

      const name = nextUser.displayName || nextUser.email?.split('@')[0] || 'Atleta';
      const docRef = doc(activeDb, 'users', nextUser.uid, 'app', 'main');
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const loaded = safeState(snap.data(), name);
        if (isLegacyDemoState(loaded)) {
          const clean = createEmptyState(name);
          await setDoc(docRef, JSON.parse(JSON.stringify(clean)));
          setState(clean);
        } else {
          setState(loaded);
        }
      } else {
        const seed = createEmptyState(name);
        await setDoc(docRef, JSON.parse(JSON.stringify(seed)));
        setState(seed);
      }
      setReady(true);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = cleanEmail(email);
    if (!firebaseEnabled || !auth) {
      const raw = localStorage.getItem(LOCAL_ACCOUNT_KEY);
      if (!raw) return { ok: false, error: 'Crie sua conta primeiro para entrar no aplicativo.' };
      try {
        const account = JSON.parse(raw) as LocalAccount;
        const passwordHash = await hashPassword(password);
        if (account.email !== normalizedEmail || account.passwordHash !== passwordHash) {
          return { ok: false, error: 'E-mail ou senha inválidos.' };
        }
        localStorage.setItem(LOCAL_SESSION_KEY, '1');
        setLocalAuthenticated(true);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Não foi possível acessar a conta local. Crie a conta novamente.' };
      }
    }
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: cleanError(e) };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = cleanEmail(email);
    const cleanName = name.trim();
    if (cleanName.length < 2) return { ok: false, error: 'Digite o nome para criar a conta.' };

    if (!firebaseEnabled || !auth) {
      const raw = localStorage.getItem(LOCAL_ACCOUNT_KEY);
      if (raw) {
        try {
          const existing = JSON.parse(raw) as LocalAccount;
          if (existing.email === normalizedEmail) return { ok: false, error: 'Este e-mail já está cadastrado neste aparelho.' };
        } catch { /* ignora conta local inválida */ }
      }
      const passwordHash = await hashPassword(password);
      const account: LocalAccount = { name: cleanName, email: normalizedEmail, passwordHash };
      localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
      localStorage.setItem(LOCAL_SESSION_KEY, '1');
      const next = createEmptyState(cleanName);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState(next);
      setLocalAuthenticated(true);
      return { ok: true };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateFirebaseProfile(credential.user, { displayName: cleanName });
      const seed = createEmptyState(cleanName);
      if (db) await setDoc(doc(db, 'users', credential.user.uid, 'app', 'main'), JSON.parse(JSON.stringify(seed)));
      setState(seed);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: cleanError(e) };
    }
  };

  const resetPassword = async (email: string): Promise<LoginResult> => {
    const normalizedEmail = cleanEmail(email);
    if (!normalizedEmail) return { ok: false, error: 'Digite seu e-mail para recuperar a senha.' };
    if (!firebaseEnabled || !auth) {
      return { ok: false, error: 'A recuperação por e-mail ficará disponível assim que o Firebase for configurado.' };
    }
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: cleanError(e) };
    }
  };

  const logout = async () => {
    if (firebaseEnabled && auth) {
      await signOut(auth);
      return;
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setLocalAuthenticated(false);
  };

  const updateRoutine = async (routine: RoutineDay) => {
    const next = {
      ...state,
      routines: state.routines.map((item) => item.id === routine.id ? routine : item),
    };
    await persist(next);
  };

  const saveWorkout = async (routineId: string, entries: Record<string, SetEntry[]>, durationMin: number) => {
    const routine = state.routines.find((item) => item.id === routineId);
    if (!routine) return 0;

    let records = 0;
    const exerciseLogs = routine.exercises.map((exercise) => {
      const sets = entries[exercise.id] || [];
      const previousBest = Math.max(0, ...state.sessions.flatMap((session) =>
        session.exercises.filter((item) => item.exerciseId === exercise.id).map((item) => item.bestLoad)
      ));
      const bestLoad = Math.max(0, ...sets.map((set) => Number(set.load) || 0));
      if (bestLoad > previousBest && previousBest > 0) records += 1;
      return { exerciseId: exercise.id, name: exercise.name, sets, previousBest, bestLoad };
    });

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newSession = {
      id: `${Date.now()}`,
      date,
      routineId,
      title: routine.title,
      durationMin,
      exercises: exerciseLogs,
      records,
    };

    const updatedRoutine: RoutineDay = {
      ...routine,
      exercises: routine.exercises.map((exercise) => {
        const sets = entries[exercise.id] || [];
        if (!sets.length) return exercise;
        const bestLoad = Math.max(0, ...sets.map((set) => Number(set.load) || 0));
        const bestSet = [...sets].reverse().find((set) => Number(set.load) === bestLoad) ?? sets[sets.length - 1];
        return {
          ...exercise,
          defaultLoad: bestLoad,
          defaultReps: Math.max(1, Number(bestSet?.reps) || exercise.defaultReps),
        };
      }),
    };

    const next: AppState = {
      ...state,
      routines: state.routines.map((item) => item.id === routineId ? updatedRoutine : item),
      sessions: [newSession, ...state.sessions],
    };
    await persist(next);
    return records;
  };

  const addMeasurement = async (measurement: Omit<Measurement, 'id'>) => {
    const item: Measurement = { ...measurement, id: `${Date.now()}` };
    await persist({ ...state, measurements: [...state.measurements, item] });
  };

  const updateProfile = async (name: string, goal: string, weeklyGoal: number) => {
    await persist({ ...state, profile: { name, goal, weeklyGoal } });
    if (!firebaseEnabled) {
      const raw = localStorage.getItem(LOCAL_ACCOUNT_KEY);
      if (raw) {
        try {
          const account = JSON.parse(raw) as LocalAccount;
          localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify({ ...account, name }));
        } catch { /* sem ação */ }
      }
    }
  };

  const addProgressPhoto = async (file: File) => {
    let url = '';
    if (firebaseEnabled && storage && user) {
      const path = `users/${user.uid}/progress/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      url = await getDownloadURL(fileRef);
    } else {
      url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
    }
    const today = new Date().toISOString().slice(0, 10);
    await persist({ ...state, photos: [{ id: `${Date.now()}`, date: today, url }, ...state.photos] });
    return url;
  };

  const resetData = async () => {
    let name = state.profile.name || 'Atleta';
    if (!firebaseEnabled) {
      const raw = localStorage.getItem(LOCAL_ACCOUNT_KEY);
      if (raw) {
        try { name = (JSON.parse(raw) as LocalAccount).name || name; } catch { /* sem ação */ }
      }
    } else if (user?.displayName) {
      name = user.displayName;
    }
    await persist(createEmptyState(name));
  };

  const isAuthenticated = firebaseEnabled ? Boolean(user) : localAuthenticated;

  const value = useMemo(() => ({
    state,
    ready,
    user,
    cloudMode: firebaseEnabled,
    isAuthenticated,
    login,
    signup,
    resetPassword,
    logout,
    updateRoutine,
    saveWorkout,
    addMeasurement,
    updateProfile,
    addProgressPhoto,
    resetData,
  }), [state, ready, user, localAuthenticated, persist]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
