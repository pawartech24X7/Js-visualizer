import { ChevronDown, ChevronRight } from 'lucide-react'
import { useContentStore, useUIStore } from '@/store'
import type { TopicCategory } from '@/types'

const categoryLabels: Record<TopicCategory, string> = {
  fundamentals: 'Fundamentals & Syntax',
  'control-flow': 'Control Flow',
  functions: 'Functions & Execution',
  'arrays-objects': 'Arrays & Objects',
  async: 'Asynchronous JS',
  'dom-web-apis': 'DOM & Web APIs',
  oop: 'OOP',
  professional: 'Professional Topics',
}

const categories: TopicCategory[] = [
  'fundamentals',
  'control-flow',
  'functions',
  'arrays-objects',
  'async',
  'dom-web-apis',
  'oop',
  'professional',
]

export function Sidebar() {
  const { topics, expandedCategories, toggleCategory } = useContentStore()
  const { selectTopic, selectedTopicId } = useUIStore()

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
        Interview Topics
      </h2>

      <div className="space-y-1">
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category)
          const categoryTopics = topics.filter((t) => t.category === category)

          return (
            <div key={category}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                )}
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {categoryLabels[category]}
                </span>
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                  {categoryTopics.length}
                </span>
              </button>

              {/* Topics List */}
              {isExpanded && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {categoryTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => selectTopic(topic.id)}
                      className={`
                        w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors
                        ${selectedTopicId === topic.id
                          ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                        }
                      `}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
