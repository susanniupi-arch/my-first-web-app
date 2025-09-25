import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  id: number;
  name?: string;
  color?: string;
}

interface TagsState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTags: () => Promise<void>;
  createTag: (tag: CreateTagRequest) => Promise<void>;
  updateTag: (tag: UpdateTagRequest) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  addTagToNote: (noteId: number, tagId: number) => Promise<void>;
  removeTagFromNote: (noteId: number, tagId: number) => Promise<void>;
  getTagsForNote: (noteId: number) => Promise<Tag[]>;
  getNotesByTag: (tagId: number) => Promise<void>;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await invoke<Tag[]>('get_all_tags');
      set({ tags, isLoading: false });
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  createTag: async (tagData: CreateTagRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newTag = await invoke<Tag>('create_tag', { tag: tagData });
      set(state => ({
        tags: [...state.tags, newTag],
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  updateTag: async (tagData: UpdateTagRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTag = await invoke<Tag>('update_tag', { tag: tagData });
      set(state => ({
        tags: state.tags.map(tag => 
          tag.id === updatedTag.id ? updatedTag : tag
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  deleteTag: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_tag', { id });
      set(state => ({
        tags: state.tags.filter(tag => tag.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },

  addTagToNote: async (noteId: number, tagId: number) => {
    try {
      await invoke('add_tag_to_note', { noteId, tagId });
    } catch (error) {
      set({ error: error as string });
    }
  },

  removeTagFromNote: async (noteId: number, tagId: number) => {
    try {
      await invoke('remove_tag_from_note', { noteId, tagId });
    } catch (error) {
      set({ error: error as string });
    }
  },

  getTagsForNote: async (noteId: number): Promise<Tag[]> => {
    try {
      const tags = await invoke<Tag[]>('get_tags_for_note', { noteId });
      return tags;
    } catch (error) {
      set({ error: error as string });
      return [];
    }
  },

  getNotesByTag: async (tagId: number) => {
    set({ isLoading: true, error: null });
    try {
      // This would typically update a notes list, but since we're in tags store,
      // we'll just handle the API call. The actual notes would be managed by notesStore
      await invoke('get_notes_by_tag', { tagId });
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },
}));