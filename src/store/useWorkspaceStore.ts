import { create } from 'zustand';
import { WorkspaceElement, ElementType, WorkspaceVersion, Language, ProjectDetails } from '../types';

const defaultBg = () => ({
  backgroundImage: null as string | null,
  backgroundPos: { x: 0, y: 0 },
  backgroundScale: { x: 1, y: 1 },
});

interface WorkspaceState {
  language: Language;
  projectDetails: ProjectDetails | null;
  isEditingBackground: boolean;
  versions: WorkspaceVersion[];
  activeVersionId: string;
  viewMode: 'canvas' | 'summary';
  placementMode: ElementType | null;

  setLanguage: (lang: Language) => void;
  setProjectDetails: (details: ProjectDetails) => void;
  setClientLogoUrl: (url: string) => void;
  setBackgroundImage: (image: string | null) => void;
  setBackgroundPos: (pos: { x: number; y: number }) => void;
  setBackgroundScale: (scale: { x: number; y: number }) => void;
  clearVersionBackground: () => void;
  setIsEditingBackground: (isEditing: boolean) => void;
  setPlacementMode: (type: ElementType | null) => void;
  addElement: (type: ElementType, x: number, y: number) => string;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  updateElementCapacity: (id: string, capacity: number) => void;
  removeElement: (id: string) => void;
  clearWorkspace: () => void;
  addVersion: () => void;
  removeVersion: (id: string) => void;
  setActiveVersion: (id: string) => void;
  setViewMode: (mode: 'canvas' | 'summary') => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  language: 'es',
  projectDetails: null,
  isEditingBackground: false,
  versions: [{ id: 'v1', name: 'Alternative A', elements: [], ...defaultBg() }],
  activeVersionId: 'v1',
  viewMode: 'canvas',
  placementMode: null,

  setLanguage: (lang) => set({ language: lang }),
  setProjectDetails: (details) => set({ projectDetails: details }),
  setClientLogoUrl: (url) =>
    set((state) => ({
      projectDetails: state.projectDetails
        ? { ...state.projectDetails, clientLogoUrl: url || undefined }
        : null,
    })),

  setBackgroundImage: (image) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId
          ? { ...v, backgroundImage: image, backgroundPos: { x: 0, y: 0 }, backgroundScale: { x: 1, y: 1 } }
          : v
      ),
    })),

  setBackgroundPos: (pos) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId ? { ...v, backgroundPos: pos } : v
      ),
    })),

  setBackgroundScale: (scale) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId ? { ...v, backgroundScale: scale } : v
      ),
    })),

  clearVersionBackground: () =>
    set((state) => ({
      isEditingBackground: false,
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId ? { ...v, ...defaultBg() } : v
      ),
    })),

  setIsEditingBackground: (isEditing) => set({ isEditingBackground: isEditing, placementMode: null }),
  setPlacementMode: (type) => set({ placementMode: type, isEditingBackground: false }),

  addElement: (type, x, y) => {
    let newId = '';
    set((state) => {
      let width = 60, height = 60;
      if (type === 'desk_bench')      { width = 120; height = 60; }
      if (type === 'desk_individual') { width = 60;  height = 60; }
      if (type === 'desk_operative')  { width = 80;  height = 60; }
      if (type === 'desk_executive')  { width = 100; height = 80; }
      if (type === 'meeting_room')    { width = 150; height = 120; }
      if (type === 'huddle_room')     { width = 100; height = 80; }
      if (type === 'private_office')  { width = 120; height = 120; }
      if (type === 'lounge')          { width = 100; height = 80; }
      if (type === 'dining')          { width = 180; height = 100; }
      if (type === 'reception')       { width = 100; height = 100; }
      if (type === 'archive')         { width = 80;  height = 40; }
      if (type === 'site')            { width = 60;  height = 60; }
      const el: WorkspaceElement = { id: Math.random().toString(36).substring(2, 9), type, x, y, width, height };
      newId = el.id;
      return {
        versions: state.versions.map((v) =>
          v.id === state.activeVersionId ? { ...v, elements: [...v.elements, el] } : v
        ),
      };
    });
    return newId;
  },

  updateElementPosition: (id, x, y) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId
          ? { ...v, elements: v.elements.map((el) => (el.id === id ? { ...el, x, y } : el)) }
          : v
      ),
    })),

  updateElementSize: (id, width, height) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId
          ? { ...v, elements: v.elements.map((el) => (el.id === id ? { ...el, width, height } : el)) }
          : v
      ),
    })),

  updateElementCapacity: (id, capacity) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId
          ? { ...v, elements: v.elements.map((el) => (el.id === id ? { ...el, capacity } : el)) }
          : v
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId
          ? { ...v, elements: v.elements.filter((el) => el.id !== id) }
          : v
      ),
    })),

  clearWorkspace: () =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === state.activeVersionId ? { ...v, elements: [] } : v
      ),
    })),

  addVersion: () =>
    set((state) => {
      const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const name = `Alternative ${chars[state.versions.length] ?? state.versions.length + 1}`;
      
      // FIX: Generamos el ID UNA SOLA VEZ para que coincida en la tab y en la versión activa
      const newId = `v${Date.now()}`;
      
      return {
        versions: [...state.versions, { id: newId, name, elements: [], ...defaultBg() }],
        activeVersionId: newId,
        viewMode: 'canvas' as const,
        placementMode: null,
      };
    }),

  removeVersion: (id) =>
    set((state) => {
      if (state.versions.length <= 1) return state;
      const next = state.versions.filter((v) => v.id !== id);
      const newActive = state.activeVersionId === id ? next[0].id : state.activeVersionId;
      return { versions: next, activeVersionId: newActive, viewMode: 'canvas' as const };
    }),

  setActiveVersion: (id) => set({ activeVersionId: id, viewMode: 'canvas' }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
