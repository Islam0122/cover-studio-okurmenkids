import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { CoverDocument, Project } from '../types/template'
import { uid } from '../utils/document'

interface ProjectState {
  projects: Project[]
  storageError: string | null
  createProject: (doc: CoverDocument, name: string) => Project
  saveProject: (id: string, patch: { name?: string; document?: CoverDocument }) => void
  duplicateProject: (id: string) => Project | null
  deleteProject: (id: string) => void
  clearStorageError: () => void
}

let reportStorageError: (msg: string) => void = () => {}

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      reportStorageError('Хранилище браузера заполнено — изменения не сохранились. Удалите старые проекты или используйте изображения поменьше.')
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      storageError: null,
      createProject: (document, name) => {
        const now = Date.now()
        const project: Project = { id: uid('prj'), name, createdAt: now, updatedAt: now, document }
        set({ projects: [project, ...get().projects] })
        return project
      },
      saveProject: (id, patch) => {
        set({
          projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
        })
      },
      duplicateProject: (id) => {
        const source = get().projects.find((p) => p.id === id)
        if (!source) return null
        const now = Date.now()
        const copy: Project = {
          ...structuredClone(source),
          id: uid('prj'),
          name: `${source.name} (копия)`,
          createdAt: now,
          updatedAt: now,
        }
        set({ projects: [copy, ...get().projects] })
        return copy
      },
      deleteProject: (id) => set({ projects: get().projects.filter((p) => p.id !== id) }),
      clearStorageError: () => set({ storageError: null }),
    }),
    {
      name: 'cover-studio:projects',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ projects: s.projects }),
    },
  ),
)

reportStorageError = (msg) => useProjectStore.setState({ storageError: msg })
