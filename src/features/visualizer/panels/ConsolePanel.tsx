import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Trash2 } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'

export function ConsolePanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const consoleOutput = currentStep?.consoleOutput || []

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '›'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-[var(--color-accent-red)]'
      case 'warn': return 'text-[var(--color-accent-orange)]'
      case 'info': return 'text-[var(--color-accent-cyan)]'
      default: return 'text-[var(--color-text-primary)]'
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--color-text-muted)]" />
          Console
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-[var(--color-text-muted)]">
          <Trash2 className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto font-mono text-sm bg-[var(--color-bg-primary)] rounded-lg">
        {consoleOutput.length === 0 ? (
          <div className="text-[var(--color-text-muted)] text-center py-4">
            Console output will appear here
          </div>
        ) : (
          <div className="space-y-1 p-2">
            <AnimatePresence>
              {consoleOutput.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`
                    flex items-start gap-2 py-1 px-2 rounded
                    ${entry.type === 'error' ? 'bg-[var(--color-accent-red)]/10' : ''}
                    ${entry.type === 'warn' ? 'bg-[var(--color-accent-orange)]/10' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{getTypeIcon(entry.type)}</span>
                  <span className={getTypeColor(entry.type)}>
                    {entry.args.map((arg, i) => (
                      <span key={i}>
                        {i > 0 && ' '}
                        {formatArg(arg)}
                      </span>
                    ))}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatArg(arg: { type: string; value: unknown }): string {
  if (arg.type === 'undefined') return 'undefined'
  if (arg.type === 'null') return 'null'
  if (arg.type === 'string') return String(arg.value)
  if (arg.type === 'object') return JSON.stringify(arg.value, null, 2)
  if (arg.type === 'array') return JSON.stringify(arg.value)
  return String(arg.value)
}
