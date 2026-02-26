import { useContentStore, useUIStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import type { Topic } from '@/types'

export function TopicsPage() {
  const { topics } = useContentStore()
  const { selectedTopicId, selectTopic } = useUIStore()

  const selectedTopic = topics.find((t) => t.id === selectedTopicId)

  if (!selectedTopic) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Select a Topic
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Choose a topic from the sidebar to view its content
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <TopicDetail topic={selectedTopic} onBack={() => selectTopic(null)} />
    </div>
  )
}

interface TopicDetailProps {
  topic: Topic
  onBack: () => void
}

function TopicDetail({ topic }: TopicDetailProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {topic.title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{topic.description}</p>
      </div>

      {/* Sub Topics */}
      {topic.subTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topic.subTopics.map((sub) => (
                <Badge key={sub.id} variant="default">
                  {sub.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-[var(--color-text-secondary)] font-sans">
              {topic.explanation}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Code Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-[var(--color-bg-primary)] p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono text-[var(--color-text-primary)]">
              {topic.codeExample}
            </code>
          </pre>
        </CardContent>
      </Card>

      {/* Interview Questions */}
      {topic.interviewQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Interview Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topic.interviewQuestions.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[var(--color-text-secondary)]"
                >
                  <span className="text-[var(--color-accent-blue)] font-mono">
                    {i + 1}.
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
