import { create } from 'zustand';
import { LocalStorage, DataSync } from '../utils/storage';
import { invoke } from '@tauri-apps/api/tauri';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  project_id?: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  project_id?: string;
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  project_id?: string;
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (note: CreateNoteRequest) => Promise<void>;
  updateNote: (id: string, note: Partial<CreateNoteRequest>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  searchNotes: (query: string) => Promise<void>;
  getNotesByProject: (projectId: string) => Promise<Note[]>;
}

export const useNotesStore = create<NotesState>((set, get) => {
  // 从本地存储加载数据
  const loadFromStorage = (): Note[] => {
    const localNotes = LocalStorage.getItem<Note[]>('notes', []);
    return localNotes || [];
  };

  // 保存数据到本地存储
  const saveToStorage = (notes: Note[]) => {
    LocalStorage.setItem('notes', notes);
  };

  // 注册数据同步回调
  DataSync.registerSyncCallback('notes', () => {
    const { notes } = get();
    saveToStorage(notes);
  });

  return {
    notes: loadFromStorage(),
    currentNote: null,
    isLoading: false,
    error: null,

    fetchNotes: async () => {
      set({ isLoading: true, error: null });
      try {
        // 首先从本地存储加载
        const localNotes = loadFromStorage();
        set({ notes: localNotes });

        // 如果本地没有数据，使用模拟数据
        if (localNotes.length === 0) {
          const mockNotes: Note[] = [
            {
              id: '1',
              title: '欢迎使用笔记功能',
              content: '# 欢迎使用笔记功能\n\n这是一个示例笔记，展示了Markdown编辑功能。\n\n## 功能特点\n\n- 支持Markdown语法\n- 标签管理\n- 搜索功能\n- 实时预览',
              tags: ['示例', '功能介绍'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ];
          
          set({ notes: mockNotes });
          saveToStorage(mockNotes);
        }
        
        set({ isLoading: false });
      } catch (error) {
        set({ error: String(error), isLoading: false });
      }
    },

    createNote: async (noteData: CreateNoteRequest) => {
      set({ isLoading: true, error: null });
      try {
        const newNote: Note = {
          id: Date.now().toString(),
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          project_id: noteData.project_id,
        };
        
        const updatedNotes = [newNote, ...get().notes];
        set({ notes: updatedNotes, isLoading: false });
        saveToStorage(updatedNotes);
      } catch (error) {
        set({ error: String(error), isLoading: false });
      }
    },

  updateNote: async (id: string, noteData: Partial<CreateNoteRequest>) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟更新笔记
      set(state => {
        const updatedNotes = state.notes.map(note => 
          note.id === id 
            ? { 
                ...note, 
                ...noteData,
                updated_at: new Date().toISOString()
              }
            : note
        );
        saveToStorage(updatedNotes);
        return {
          notes: updatedNotes,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟删除笔记
      set(state => {
        const filteredNotes = state.notes.filter(note => note.id !== id);
        saveToStorage(filteredNotes);
        return {
          notes: filteredNotes,
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  searchNotes: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await invoke<Note[]>('search_notes', { query });
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  getNotesByProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟按项目获取笔记
      const { notes } = get();
      const projectNotes = notes.filter(note => note.project_id === projectId);
      set({ isLoading: false });
      return projectNotes;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      return [];
    }
  },
  };
});