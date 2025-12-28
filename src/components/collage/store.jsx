import { create } from 'zustand';

export const useCollageStore = create((set, get) => ({
  canvasSpecs: { width: 2000, height: 2000, name: 'Square (1:1)' },
  orientation: 'portrait',
  objects: [], // { id, type: 'image'|'text', x, y, rotation, scaleX, scaleY, content, ... }
  selectedId: null,
  stageScale: 1,
  isAdmin: false,
  
  // Actions
  setCanvasSpecs: (specs) => set((state) => {
    // If we want to maintain the current orientation visual aspect ratio regardless of dimensions
    return { 
        canvasSpecs: specs,
    };
  }),
  
  setOrientation: (orientation) => set({ orientation }),

  addObject: (object) => set((state) => ({ 
    objects: [...state.objects, object], 
    selectedId: object.id 
  })),

  updateObject: (id, newAttrs) => set((state) => ({
    objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...newAttrs } : obj)),
  })),

  deleteObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),

  setObjects: (objects) => set({ objects, selectedId: null }),
  selectObject: (id) => set({ selectedId: id }),
  setStageScale: (scale) => set({ stageScale: scale }),
  toggleAdmin: () => set((state) => ({ isAdmin: !state.isAdmin })),
  
  // Z-Index
  bringToFront: (id) => set((state) => {
    const index = state.objects.findIndex(o => o.id === id);
    if (index === -1 || index === state.objects.length - 1) return state;
    const newObjects = [...state.objects];
    const [item] = newObjects.splice(index, 1);
    newObjects.push(item);
    return { objects: newObjects };
  }),
  
  sendToBack: (id) => set((state) => {
    const index = state.objects.findIndex(o => o.id === id);
    if (index === -1 || index === 0) return state;
    const newObjects = [...state.objects];
    const [item] = newObjects.splice(index, 1);
    newObjects.unshift(item);
    return { objects: newObjects };
  }),
}));