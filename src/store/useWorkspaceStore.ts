import { create } from 'zustand';
import { WorkspaceElement, ElementType, WorkspaceVersion, Language, ProjectDetails } from '../types';

interface WorkspaceState {
  language: Language;
  projectDetails: ProjectDetails | null;
  backgroundImage: string | null;
  backgroundPos: { x: number; y: number };
  backgroundScale: { x: number; y: number };
  isEditingBackground: boolean;
  versions: WorkspaceVersion[];
  activeVersionId: string;
  viewMode: 'canvas' | 'summary';
  placementMode: ElementType | null;
  setLanguage: (lang: Language) => void;
  setProjectDetails: (details: ProjectDetails) => void;
  setBackgroundImage: (image: string | null) => void;
  setBackgroundPos: (pos: { x: number; y: number }) => void;
  setBackgroundScale: (scale: { x: number; y: number }) => void;
  setIsEditingBackground: (isEditing: boolean) => void;
  setPlacementMode: (type: ElementType | null) => void;
  addElement: (type: ElementType, x: number, y: number) => string;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  updateElementCapacity: (id: string, capacity: number) => void;
  removeElement: (id: string) => void;
  clearWorkspace: () => void;
  addVersion: () => void;
  setActiveVersion: (id: string) => void;
  setViewMode: (mode: 'canvas' | 'summary') => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  language: 'es',
  projectDetails: null,
  backgroundImage: null,
  backgroundPos: { x: 0, y: 0 },
  backgroundScale: { x: 1, y: 1 },
  isEditingBackground: false,
  versions: [{ id: 'v1', name: 'Alternative A', elements: [] }],
  activeVersionId: 'v1',
  viewMode: 'canvas',
  placementMode: null,
  setLanguage: (lang) => set({ language: lang }),
  setProjectDetails: (details) => set({ projectDetails: details }),
  setBackgroundImage: (image) => set({ backgroundImage: image, backgroundScale: { x: 1, y: 1 }, backgroundPos: { x: 0, y: 0 } }),
  setBackgroundPos: (pos) => set({ backgroundPos: pos }),
  setBackgroundScale: (scale) => set({ backgroundScale: scale }),
  setIsEditingBackground: (isEditing) => set({ isEditingBackground: isEditing, placementMode: null }),
  setPlacementMode: (type) => set({ placementMode: type, isEditingBackground: false }),
  addElement: (type, x, y) => {
    let newId = '';
    set((state) => {
      let width = 60;
      let height = 60;
      
      if (type === 'desk_bench') { width = 120; height = 60; }
      if (type === 'desk_individual') { width = 60; height = 60; }
      if (type === 'desk_operative') { width = 80; height = 60; }
      if (type === 'desk_executive') { width = 100; height = 80; }
      if (type === 'meeting_room') { width = 150; height = 120; }
      if (type === 'private_office') { width = 120; height = 120; }
      if (type === 'lounge') { width = 100; height = 80; }
      if (type === 'dining') { width = 180; height = 100; }
      if (type === 'reception') { width = 100; height = 100; }
      if (type === 'archive') { width = 80; height = 40; }
      if (type === 'site') { width = 60; height = 60; }

      const newElement: WorkspaceElement = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        x,
        y,
        width,
        height,
      };
      
      newId = newElement.id;
      
      return {
        versions: state.versions.map(v => 
          v.id === state.activeVersionId 
            ? { ...v, elements: [...v.elements, newElement] }
            : v
        ),
        // we do not unset placement mode so they can place multiple
      };
    });
    return newId;
  },
  updateElementPosition: (id, x, y) => set((state) => ({
    versions: state.versions.map(v => 
      v.id === state.activeVersionId 
        ? { ...v, elements: v.elements.map(el => el.id === id ? { ...el, x, y } : el) }
        : v
    )
  })),
  updateElementSize: (id, width, height) => set((state) => ({
    versions: state.versions.map(v => 
      v.id === state.activeVersionId 
        ? { ...v, elements: v.elements.map(el => el.id === id ? { ...el, width, height } : el) }
        : v
    )
  })),
  updateElementCapacity: (id, capacity) => set((state) => ({
    versions: state.versions.map(v => 
      v.id === state.activeVersionId 
        ? { ...v, elements: v.elements.map(el => el.id === id ? { ...el, capacity } : el) }
        : v
    )
  })),
  removeElement: (id) => set((state) => ({
    versions: state.versions.map(v => 
      v.id === state.activeVersionId 
        ? { ...v, elements: v.elements.filter(el => el.id !== id) }
        : v
    )
  })),
  clearWorkspace: () => set((state) => ({
    versions: state.versions.map(v => 
      v.id === state.activeVersionId 
        ? { ...v, elements: [] }
        : v
    )
  })),
  addVersion: () => set((state) => {
    const newId = `v${Date.now()}`;
    const prevVersionChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const name = `Alternative ${prevVersionChars[state.versions.length] || state.versions.length + 1}`;
    
    const currentElements = state.versions.find(v => v.id === state.activeVersionId)?.elements || [];
    
    return {
      versions: [...state.versions, { id: newId, name, elements: [...currentElements] }],
      activeVersionId: newId,
      viewMode: 'canvas'
    };
  }),
  setActiveVersion: (id) => set({ activeVersionId: id, viewMode: 'canvas' }),
  setViewMode: (mode) => set({ viewMode: mode })
}));
