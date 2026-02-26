import { create } from 'zustand'
import type { Topic, Question, TopicCategory, QuestionCategory, Difficulty } from '@/types'
import { topics } from '@/data/topics'
import { questions } from '@/data/questions'

interface ContentState {
  topics: Topic[]
  questions: Question[]
  expandedCategories: TopicCategory[]
  activeQuestionCategory: QuestionCategory
  searchQuery: string
  difficultyFilter: Difficulty | null
  toggleCategory: (category: TopicCategory) => void
  setActiveQuestionCategory: (category: QuestionCategory) => void
  setSearchQuery: (query: string) => void
  setDifficultyFilter: (difficulty: Difficulty | null) => void
  getFilteredQuestions: () => Question[]
  getTopicsByCategory: (category: TopicCategory) => Topic[]
}

export const useContentStore = create<ContentState>((set, get) => ({
  topics,
  questions,
  expandedCategories: ['fundamentals'],
  activeQuestionCategory: 'array',
  searchQuery: '',
  difficultyFilter: null,

  toggleCategory: (category) => set((state) => ({
    expandedCategories: state.expandedCategories.includes(category)
      ? state.expandedCategories.filter((c) => c !== category)
      : [...state.expandedCategories, category],
  })),

  setActiveQuestionCategory: (category) => set({ activeQuestionCategory: category }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setDifficultyFilter: (difficulty) => set({ difficultyFilter: difficulty }),

  getFilteredQuestions: () => {
    const { questions, activeQuestionCategory, searchQuery, difficultyFilter } = get()
    return questions.filter((q) => {
      if (q.category !== activeQuestionCategory) return false
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query) ||
          q.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }
      return true
    })
  },

  getTopicsByCategory: (category) => {
    const { topics } = get()
    return topics.filter((t) => t.category === category)
  },
}))
