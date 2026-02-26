import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useContentStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import type { Question, QuestionCategory, Difficulty } from '@/types'

const categoryTabs: { value: QuestionCategory; label: string; count: number }[] = [
  { value: 'array', label: 'Array', count: 40 },
  { value: 'string', label: 'String', count: 30 },
  { value: 'object', label: 'Object', count: 30 },
]

const difficultyColors: Record<Difficulty, string> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
}

export function QuestionsPage() {
  const {
    activeQuestionCategory,
    setActiveQuestionCategory,
    searchQuery,
    setSearchQuery,
    difficultyFilter,
    setDifficultyFilter,
    getFilteredQuestions,
  } = useContentStore()

  const questions = getFilteredQuestions()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
          Top 100 JavaScript Coding Questions
        </h1>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveQuestionCategory(tab.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeQuestionCategory === tab.value
                  ? 'bg-[var(--color-accent-blue)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                }
              `}
            >
              {tab.label}
              <span className="ml-2 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
            />
          </div>

          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() =>
                  setDifficultyFilter(difficultyFilter === difficulty ? null : difficulty)
                }
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                  ${difficultyFilter === difficulty
                    ? difficulty === 'easy'
                      ? 'bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]'
                      : difficulty === 'medium'
                      ? 'bg-[var(--color-accent-orange)]/20 text-[var(--color-accent-orange)]'
                      : 'bg-[var(--color-accent-red)]/20 text-[var(--color-accent-red)]'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  }
                `}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-auto p-4">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            No questions found matching your criteria
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface QuestionCardProps {
  question: Question
}

function QuestionCard({ question }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>{question.title}</CardTitle>
              <Badge variant={difficultyColors[question.difficulty] as 'success' | 'warning' | 'danger'}>
                {question.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {question.description}
            </p>
            <div className="flex gap-1 mt-2">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-[var(--color-border)]">
          {/* Examples */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Examples</h4>
            <div className="space-y-2">
              {question.examples.map((example, i) => (
                <div key={i} className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg">
                  <div className="font-mono text-xs">
                    <div className="text-[var(--color-text-muted)]">Input: <span className="text-[var(--color-text-primary)]">{example.input}</span></div>
                    <div className="text-[var(--color-text-muted)]">Output: <span className="text-[var(--color-accent-green)]">{example.output}</span></div>
                    {example.explanation && (
                      <div className="text-[var(--color-text-muted)] mt-1">{example.explanation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Brute Force */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Brute Force Solution
              </h4>
              <pre className="bg-[var(--color-bg-primary)] p-3 rounded-lg overflow-x-auto text-xs">
                <code className="text-[var(--color-text-primary)]">{question.bruteForce.code}</code>
              </pre>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                {question.bruteForce.explanation}
              </p>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-[var(--color-text-muted)]">
                  Time: <span className="text-[var(--color-accent-orange)]">{question.bruteForce.timeComplexity}</span>
                </span>
                <span className="text-[var(--color-text-muted)]">
                  Space: <span className="text-[var(--color-accent-cyan)]">{question.bruteForce.spaceComplexity}</span>
                </span>
              </div>
            </div>

            {/* Optimized */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-accent-green)] mb-2">
                Optimized Solution
              </h4>
              <pre className="bg-[var(--color-bg-primary)] p-3 rounded-lg overflow-x-auto text-xs">
                <code className="text-[var(--color-text-primary)]">{question.optimized.code}</code>
              </pre>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                {question.optimized.explanation}
              </p>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-[var(--color-text-muted)]">
                  Time: <span className="text-[var(--color-accent-green)]">{question.optimized.timeComplexity}</span>
                </span>
                <span className="text-[var(--color-text-muted)]">
                  Space: <span className="text-[var(--color-accent-green)]">{question.optimized.spaceComplexity}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hints */}
          {question.hints.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Hints</h4>
              <ul className="list-disc list-inside text-sm text-[var(--color-text-secondary)] space-y-1">
                {question.hints.map((hint, i) => (
                  <li key={i}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
