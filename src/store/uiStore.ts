import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PanelId =
  | 'callStack'
  | 'executionContext'
  | 'memory'
  | 'webApis'
  | 'microTaskQueue'
  | 'taskQueue'
  | 'promises'
  | 'eventLoop'
  | 'console'

export type ViewMode = 'visualizer' | 'topics' | 'questions'

interface UIState {
  sidebarOpen: boolean
  questionsPanelOpen: boolean
  activePanels: Record<PanelId, boolean>
  viewMode: ViewMode
  selectedTopicId: string | null
  selectedQuestionId: string | null
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleQuestionsPanel: () => void
  setQuestionsPanelOpen: (open: boolean) => void
  togglePanel: (panelId: PanelId) => void
  setPanelVisible: (panelId: PanelId, visible: boolean) => void
  setViewMode: (mode: ViewMode) => void
  selectTopic: (id: string | null) => void
  selectQuestion: (id: string | null) => void
  resetPanels: () => void
}

const DEFAULT_PANELS: Record<PanelId, boolean> = {
  callStack: true,
  executionContext: true,
  memory: true,
  webApis: true,
  microTaskQueue: true,
  taskQueue: true,
  promises: true,
  eventLoop: true,
  console: true,
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      questionsPanelOpen: false,
      activePanels: { ...DEFAULT_PANELS },
      viewMode: 'visualizer',
      selectedTopicId: null,
      selectedQuestionId: null,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleQuestionsPanel: () =>
        set((state) => ({
          questionsPanelOpen: !state.questionsPanelOpen,
        })),

      setQuestionsPanelOpen: (open) => set({ questionsPanelOpen: open }),

      togglePanel: (panelId) =>
        set((state) => ({
          activePanels: {
            ...state.activePanels,
            [panelId]: !state.activePanels[panelId],
          },
        })),

      setPanelVisible: (panelId, visible) =>
        set((state) => ({
          activePanels: {
            ...state.activePanels,
            [panelId]: visible,
          },
        })),

      setViewMode: (mode) => set({ viewMode: mode }),

      selectTopic: (id) => set({ selectedTopicId: id }),

      selectQuestion: (id) => set({ selectedQuestionId: id }),

      resetPanels: () => set({ activePanels: { ...DEFAULT_PANELS } }),
    }),
    {
      name: 'js-visualizer-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activePanels: state.activePanels,
      }),
    }
  )
)
