export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionCategory = 'array' | 'string' | 'object'

export type TopicCategory =
  | 'fundamentals'
  | 'control-flow'
  | 'functions'
  | 'arrays-objects'
  | 'async'
  | 'dom-web-apis'
  | 'oop'
  | 'professional'

export interface TopicSubItem {
  id: string
  title: string
  description: string
}

export interface Topic {
  id: string
  category: TopicCategory
  title: string
  description: string
  icon: string
  subTopics: TopicSubItem[]
  explanation: string
  codeExample: string
  interviewQuestions: string[]
}

export interface Question {
  id: string
  category: QuestionCategory
  title: string
  description: string
  difficulty: Difficulty
  tags: string[]
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints: string[]
  bruteForce: {
    code: string
    explanation: string
    timeComplexity: string
    spaceComplexity: string
  }
  optimized: {
    code: string
    explanation: string
    timeComplexity: string
    spaceComplexity: string
  }
  hints: string[]
}

export interface TopicsState {
  topics: Topic[]
  selectedTopicId: string | null
  expandedCategories: TopicCategory[]
}

export interface QuestionsState {
  questions: Question[]
  selectedQuestionId: string | null
  activeCategory: QuestionCategory
  searchQuery: string
  difficultyFilter: Difficulty | null
}
