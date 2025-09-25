import { create } from 'zustand';
import { LocalStorage, DataSync } from '../utils/storage';
import { invoke } from '@tauri-apps/api/tauri';

export interface PomodoroSession {
  id: number;
  task_id?: number;
  session_type: 'work' | 'short_break' | 'long_break';
  duration_minutes: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface CreatePomodoroSessionRequest {
  task_id?: number;
  session_type: 'work' | 'short_break' | 'long_break';
  duration_minutes: number;
}

export interface PomodoroStats {
  total_sessions: number;
  completed_sessions: number;
  total_focus_time: number;
  sessions_today: number;
  focus_time_today: number;
}

interface PomodoroState {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  stats: PomodoroStats | null;
  isRunning: boolean;
  timeRemaining: number; // in seconds
  isLoading: boolean;
  error: string | null;
  
  // Timer settings
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  
  // Actions
  fetchSessions: () => Promise<void>;
  startSession: (sessionData: CreatePomodoroSessionRequest) => Promise<void>;
  completeSession: (id: number) => Promise<void>;
  cancelSession: (id: number) => Promise<void>;
  getStats: () => Promise<void>;
  getSessionsByTask: (taskId: number) => Promise<void>;
  
  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimeRemaining: (seconds: number) => void;
  
  // Settings actions
  updateSettings: (settings: { workDuration?: number; shortBreakDuration?: number; longBreakDuration?: number }) => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  // 从本地存储加载数据
  const loadFromStorage = () => {
    const sessions = LocalStorage.getItem<PomodoroSession[]>('pomodoro_sessions', []);
    const settings = LocalStorage.getItem<any>('pomodoro_settings', {});
    return {
      sessions: sessions || [],
      workDuration: settings.workDuration || 25,
      shortBreakDuration: settings.shortBreakDuration || 5,
      longBreakDuration: settings.longBreakDuration || 15,
    };
  };

  // 保存会话数据到本地存储
  const saveSessionsToStorage = (sessions: PomodoroSession[]) => {
    LocalStorage.setItem('pomodoro_sessions', sessions);
  };

  // 保存设置到本地存储
  const saveSettingsToStorage = (settings: any) => {
    LocalStorage.setItem('pomodoro_settings', settings);
  };

  // 注册数据同步回调
  DataSync.registerSyncCallback('pomodoro', () => {
    const { sessions, workDuration, shortBreakDuration, longBreakDuration } = get();
    saveSessionsToStorage(sessions);
    saveSettingsToStorage({ workDuration, shortBreakDuration, longBreakDuration });
  });

  const initialData = loadFromStorage();

  return {
    sessions: initialData.sessions,
    currentSession: null,
    stats: null,
    isRunning: false,
    timeRemaining: initialData.workDuration * 60, // Convert to seconds
    isLoading: false,
    error: null,
    
    // Settings from storage
    workDuration: initialData.workDuration,
    shortBreakDuration: initialData.shortBreakDuration,
    longBreakDuration: initialData.longBreakDuration,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      // 模拟获取番茄钟会话数据
      const mockSessions: PomodoroSession[] = [
        {
          id: 1,
          session_type: 'work',
          duration_minutes: 25,
          completed: true,
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          session_type: 'short_break',
          duration_minutes: 5,
          completed: true,
          started_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 90 * 60 * 1000 + 5 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          session_type: 'work',
          duration_minutes: 25,
          completed: true,
          started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 60 * 60 * 1000 + 25 * 60 * 1000).toISOString()
        }
      ];
      set({ sessions: mockSessions, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  startSession: async (sessionData: CreatePomodoroSessionRequest) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟创建新的番茄钟会话
      const newSession: PomodoroSession = {
        id: Date.now(),
        ...sessionData,
        completed: false,
        started_at: new Date().toISOString()
      };
      
      set(state => {
        const updatedSessions = [newSession, ...state.sessions];
        saveSessionsToStorage(updatedSessions);
        return {
          sessions: updatedSessions,
          currentSession: newSession,
          timeRemaining: sessionData.duration_minutes * 60,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  completeSession: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟完成番茄钟会话
      const completedAt = new Date().toISOString();
      set(state => {
        const updatedSessions = state.sessions.map(session =>
          session.id === id
            ? { ...session, completed: true, completed_at: completedAt }
            : session
        );
        saveSessionsToStorage(updatedSessions);
        return {
          sessions: updatedSessions,
          currentSession: state.currentSession?.id === id ? null : state.currentSession,
          isRunning: false,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  cancelSession: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟取消番茄钟会话
      set(state => {
        const filteredSessions = state.sessions.filter(session => session.id !== id);
        saveSessionsToStorage(filteredSessions);
        return {
          sessions: filteredSessions,
          currentSession: state.currentSession?.id === id ? null : state.currentSession,
          isRunning: false,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  getStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // 模拟获取番茄钟统计数据
      const state = get();
      const today = new Date().toDateString();
      const todaySessions = state.sessions.filter(session => 
        new Date(session.started_at).toDateString() === today
      );
      
      const mockStats: PomodoroStats = {
        total_sessions: state.sessions.length,
        completed_sessions: state.sessions.filter(s => s.completed).length,
        total_focus_time: state.sessions
          .filter(s => s.completed && s.session_type === 'work')
          .reduce((total, s) => total + s.duration_minutes, 0),
        sessions_today: todaySessions.length,
        focus_time_today: todaySessions
          .filter(s => s.completed && s.session_type === 'work')
          .reduce((total, s) => total + s.duration_minutes, 0)
      };
      
      set({ stats: mockStats, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  getSessionsByTask: async (taskId: number) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟根据任务ID获取番茄钟会话
      const state = get();
      const taskSessions = state.sessions.filter(session => session.task_id === taskId);
      set({ sessions: taskSessions, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  startTimer: () => {
    set({ isRunning: true });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  resetTimer: () => {
    const state = get();
    const duration = state.currentSession?.duration_minutes || state.workDuration;
    set({ 
      isRunning: false, 
      timeRemaining: duration * 60 
    });
  },

  setTimeRemaining: (seconds: number) => {
    set({ timeRemaining: seconds });
  },

  updateSettings: (settings) => {
    set(state => ({
      ...state,
      ...settings
    }));
    // 保存设置到本地存储
    const { workDuration, shortBreakDuration, longBreakDuration } = get();
    saveSettingsToStorage({ workDuration, shortBreakDuration, longBreakDuration });
  },
  };
});