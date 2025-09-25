import { create } from 'zustand';
import { LocalStorage, DataSync } from '../utils/storage';
import { invoke } from '@tauri-apps/api/tauri';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  project_id?: number;
  parent_task_id?: number;
  position: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: number;
  parent_task_id?: number;
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: number;
  parent_task_id?: number;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'pending' | 'completed';
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (task: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskComplete: (id: number) => Promise<void>;
  updateTaskPosition: (taskId: number, newPosition: number) => Promise<void>;
  getTasksByProject: (projectId: number) => Promise<Task[]>;
  setFilter: (filter: 'all' | 'pending' | 'completed') => void;
}

export const useTasksStore = create<TasksState>((set, get) => {
  // 从本地存储加载数据
  const loadFromStorage = (): Task[] => {
    const localTasks = LocalStorage.getItem<Task[]>('tasks', []);
    return localTasks || [];
  };

  // 保存数据到本地存储
  const saveToStorage = (tasks: Task[]) => {
    LocalStorage.setItem('tasks', tasks);
  };

  // 注册数据同步回调
  DataSync.registerSyncCallback('tasks', () => {
    const { tasks } = get();
    saveToStorage(tasks);
  });

  return {
    tasks: loadFromStorage(),
    isLoading: false,
    error: null,
    filter: 'all',

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用，实际应该调用Tauri命令
      // const tasks = await invoke('get_tasks') as Task[];
      
      // 临时使用模拟数据
      const mockTasks: Task[] = [
        {
          id: 1,
          title: '完成项目文档',
          description: '整理并完善项目的技术文档和用户手册',
          completed: false,
          priority: 'high',
          due_date: '2024-01-25',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          project_id: 1,
          position: 1,
        },
        {
          id: 2,
          title: '学习新技术',
          description: '研究React 18的新特性和最佳实践',
          completed: true,
          priority: 'medium',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          position: 2,
        },
        {
          id: 3,
          title: '代码重构',
          description: '优化现有代码结构，提高可维护性',
          completed: false,
          priority: 'low',
          due_date: '2024-01-30',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          position: 3,
        }
      ];
      
      set({ tasks: mockTasks, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟创建任务
      const { tasks } = get();
      const newTask: Task = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description,
        completed: false,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: taskData.project_id,
        parent_task_id: taskData.parent_task_id,
        position: tasks.length + 1,
      };
      
      set(state => {
        const updatedTasks = [newTask, ...state.tasks];
        saveToStorage(updatedTasks);
        return {
          tasks: updatedTasks,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  updateTask: async (taskData: UpdateTaskRequest) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟更新任务
      set(state => {
        const updatedTasks = state.tasks.map(task => 
          task.id === taskData.id 
            ? { 
                ...task, 
                ...taskData,
                updated_at: new Date().toISOString()
              }
            : task
        );
        saveToStorage(updatedTasks);
        return {
          tasks: updatedTasks,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟删除任务
      set(state => {
        const filteredTasks = state.tasks.filter(task => task.id !== id);
        saveToStorage(filteredTasks);
        return {
          tasks: filteredTasks,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  toggleTaskComplete: async (id: number) => {
    try {
      // 模拟切换任务完成状态
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { ...task, completed: !task.completed, updated_at: new Date().toISOString() }
            : task
        )
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  updateTaskPosition: async (taskId: number, newPosition: number) => {
    try {
      // 模拟更新任务位置
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, position: newPosition }
            : task
        )
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  getTasksByProject: async (projectId: number): Promise<Task[]> => {
    try {
      // 模拟根据项目ID获取任务
      const state = get();
      return state.tasks.filter(task => task.project_id === projectId);
    } catch (error) {
      set({ error: String(error) });
      return [];
    }
  },

  setFilter: (filter: 'all' | 'pending' | 'completed') => {
    set({ filter });
  },
  };
});