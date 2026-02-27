import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'

export function CallStackPanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const callStack = currentStep?.callStack || []

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-stack)]" />
          Call Stack
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {callStack.length} frame{callStack.length !== 1 ? 's' : ''}
          </span>
          <Tooltip content="A mechanism to keep track of function calls. When a function is called, it's pushed onto the stack; when it returns, it's popped off.">
            <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
        {callStack.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Stack is empty
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {[...callStack].reverse().map((frame, index) => (
                <motion.div
                  key={frame.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    p-3 rounded-lg border
                    ${index === 0
                      ? 'border-[var(--color-stack)] bg-[var(--color-stack)]/10'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium text-[var(--color-text-primary)]">
                      {frame.functionName}()
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Line {frame.line}
                    </span>
                  </div>
                  {frame.arguments.length > 0 && (
                    <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      Args: {frame.arguments.map(a => formatValue(a)).join(', ')}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatValue(value: { type: string; value: unknown }): string {
  if (value.type === 'undefined') return 'undefined'
  if (value.type === 'null') return 'null'
  if (value.type === 'string') return `"${value.value}"`
  if (value.type === 'function') return `ƒ()`
  if (value.type === 'object') return '{...}'
  if (value.type === 'array') return '[...]'
  return String(value.value)
}
