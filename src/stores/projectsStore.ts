import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import { KanbanColumn, KanbanTask } from '../features/projects/components/KanbanBoard';

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  id: number;
  name?: string;
  description?: string;
  color?: string;
  archived?: boolean;
}

export interface ProjectStats {
  total_notes: number;
  total_tasks: number;
  completed_tasks: number;
  total_pomodoro_sessions: number;
}

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  projectStats: { [projectId: number]: ProjectStats };
  kanbanColumns: { [projectId: number]: KanbanColumn[] };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (project: CreateProjectRequest) => Promise<void>;
  updateProject: (project: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  archiveProject: (id: number) => Promise<void>;
  unarchiveProject: (id: number) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  getProjectStats: (projectId: number) => Promise<void>;
  
  // Kanban Actions
  fetchKanbanColumns: (projectId: number) => Promise<void>;
  createKanbanColumn: (projectId: number, title: string, color: string) => Promise<void>;
  updateKanbanColumn: (columnId: string, updates: Partial<KanbanColumn>) => Promise<void>;
  deleteKanbanColumn: (projectId: number, columnId: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number, projectId: number) => void;
  createTask: (projectId: number, columnId: string, task: Omit<KanbanTask, 'id'>) => void;
  updateTask: (projectId: number, taskId: string, updates: Partial<KanbanTask>) => void;
  deleteTask: (projectId: number, taskId: string) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  projectStats: {},
  kanbanColumns: {},
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // 模拟项目数据
      const mockProjects: Project[] = [
        {
          id: 1,
          name: '生产力应用开发',
          description: '使用Tauri和React开发跨平台生产力应用',
          color: '#3B82F6',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          archived: false,
        },
        {
          id: 2,
          name: '个人网站重构',
          description: '使用Next.js重构个人博客网站',
          color: '#10B981',
          created_at: '2024-01-05T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
          archived: false,
        },
        {
          id: 3,
          name: '学习计划',
          description: '2024年技术学习和成长计划',
          color: '#F59E0B',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-12T00:00:00Z',
          archived: false,
        },
      ];
      
      // const projects = await invoke<Project[]>('get_all_projects');
      set({ projects: mockProjects, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  createProject: async (projectData: CreateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟创建项目
      const newProject: Project = {
        id: Date.now(),
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
      };
      
      // const newProject = await invoke<Project>('create_project', { project: projectData });
      set(state => ({
        projects: [...state.projects, newProject],
        isLoading: false
      }));
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  updateProject: async (projectData: UpdateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await invoke<Project>('update_project', { project: projectData });
      set(state => ({
        projects: state.projects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        ),
        currentProject: state.currentProject?.id === updatedProject.id ? updatedProject : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_project', { id });
      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  archiveProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('archive_project', { id });
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, archived: true } : project
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  unarchiveProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('unarchive_project', { id });
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, archived: false } : project
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  getProjectStats: async (projectId: number) => {
    try {
      const stats = await invoke<ProjectStats>('get_project_stats', { projectId });
      set(state => ({
        projectStats: {
          ...state.projectStats,
          [projectId]: stats
        }
      }));
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
    }
  },

  // Kanban Actions
  fetchKanbanColumns: async (projectId: number) => {
    try {
      // 模拟看板列数据
      const mockColumns: KanbanColumn[] = [
        {
          id: 'todo',
          title: '待办',
          color: '#6B7280',
          tasks: [
            {
              id: 'task-1',
              title: '设计用户界面',
              description: '创建应用的主要用户界面设计',
              priority: 'high',
              assignee: 'Alice',
              dueDate: '2024-02-01',
              tags: ['设计', 'UI'],
            },
            {
              id: 'task-2',
              title: '数据库设计',
              description: '设计应用的数据库结构',
              priority: 'medium',
              assignee: 'Bob',
              dueDate: '2024-01-28',
              tags: ['后端', '数据库'],
            },
          ],
        },
        {
          id: 'in-progress',
          title: '进行中',
          color: '#3B82F6',
          tasks: [
            {
              id: 'task-3',
              title: '实现用户认证',
              description: '开发用户登录和注册功能',
              priority: 'high',
              assignee: 'Charlie',
              dueDate: '2024-01-30',
              tags: ['前端', '认证'],
            },
          ],
        },
        {
          id: 'review',
          title: '待审核',
          color: '#F59E0B',
          tasks: [
            {
              id: 'task-4',
              title: '代码审查',
              description: '审查最新提交的代码',
              priority: 'medium',
              assignee: 'David',
              dueDate: '2024-01-25',
              tags: ['审查'],
            },
          ],
        },
        {
          id: 'done',
          title: '已完成',
          color: '#10B981',
          tasks: [
            {
              id: 'task-5',
              title: '项目初始化',
              description: '设置项目基础结构',
              priority: 'low',
              assignee: 'Eve',
              dueDate: '2024-01-20',
              tags: ['初始化'],
            },
          ],
        },
      ];

      set(state => ({
        kanbanColumns: {
          ...state.kanbanColumns,
          [projectId]: mockColumns,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch kanban columns:', error);
    }
  },

  createKanbanColumn: async (projectId: number, title: string, color: string) => {
    const newColumn: KanbanColumn = {
      id: `column-${Date.now()}`,
      title,
      color,
      tasks: [],
    };

    set(state => ({
      kanbanColumns: {
        ...state.kanbanColumns,
        [projectId]: [...(state.kanbanColumns[projectId] || []), newColumn],
      },
    }));
  },

  updateKanbanColumn: async (columnId: string, updates: Partial<KanbanColumn>) => {
    set(state => {
      const newKanbanColumns = { ...state.kanbanColumns };
      Object.keys(newKanbanColumns).forEach(projectId => {
        newKanbanColumns[parseInt(projectId)] = newKanbanColumns[parseInt(projectId)].map(column =>
          column.id === columnId ? { ...column, ...updates } : column
        );
      });
      return { kanbanColumns: newKanbanColumns };
    });
  },

  deleteKanbanColumn: async (projectId: number, columnId: string) => {
    set(state => ({
      kanbanColumns: {
        ...state.kanbanColumns,
        [projectId]: (state.kanbanColumns[projectId] || []).filter(column => column.id !== columnId),
      },
    }));
  },

  moveTask: (taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number, projectId: number) => {
    set(state => {
      const columns = [...(state.kanbanColumns[projectId] || [])];
      const sourceColumn = columns.find(col => col.id === sourceColumnId);
      const destColumn = columns.find(col => col.id === destColumnId);

      if (!sourceColumn || !destColumn) return state;

      const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return state;

      const [task] = sourceColumn.tasks.splice(taskIndex, 1);
      destColumn.tasks.splice(destIndex, 0, task);

      return {
        kanbanColumns: {
          ...state.kanbanColumns,
          [projectId]: columns,
        },
      };
    });
  },

  createTask: (projectId: number, columnId: string, task: Omit<KanbanTask, 'id'>) => {
    const newTask: KanbanTask = {
      ...task,
      id: `task-${Date.now()}`,
    };

    set(state => {
      const columns = [...(state.kanbanColumns[projectId] || [])];
      const column = columns.find(col => col.id === columnId);
      if (column) {
        column.tasks.push(newTask);
      }

      return {
        kanbanColumns: {
          ...state.kanbanColumns,
          [projectId]: columns,
        },
      };
    });
  },

  updateTask: (projectId: number, taskId: string, updates: Partial<KanbanTask>) => {
    set(state => {
      const columns = [...(state.kanbanColumns[projectId] || [])];
      columns.forEach(column => {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...updates };
        }
      });

      return {
        kanbanColumns: {
          ...state.kanbanColumns,
          [projectId]: columns,
        },
      };
    });
  },

  deleteTask: (projectId: number, taskId: string) => {
    set(state => {
      const columns = [...(state.kanbanColumns[projectId] || [])];
      columns.forEach(column => {
        column.tasks = column.tasks.filter(task => task.id !== taskId);
      });

      return {
        kanbanColumns: {
          ...state.kanbanColumns,
          [projectId]: columns,
        },
      };
    });
  },
}));