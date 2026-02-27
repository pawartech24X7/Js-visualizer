import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'

export function TaskQueuePanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const tasks = currentStep?.taskQueue || []
  const isProcessing = currentStep?.eventLoopPhase === 'executing-macrotask'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-queue-macro)]" />
          Task Queue
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {tasks.length} pending
          </span>
          <Tooltip content="Task Queue (Macrotask Queue): Stores callbacks from setTimeout, setInterval, and I/O. These run one by one after the microtask queue is empty.">
            <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
        {tasks.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Queue is empty
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`
                    p-3 rounded-lg border
                    ${index === 0 && isProcessing
                      ? 'border-[var(--color-queue-macro)] bg-[var(--color-queue-macro)]/10 ring-2 ring-[var(--color-queue-macro)]/30'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">#{index + 1}</span>
                    <span className="font-mono text-sm text-[var(--color-queue-macro)]">
                      {task.type}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {task.callbackName}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Info text */}
        <div className="mt-4 p-2 bg-[var(--color-bg-tertiary)] rounded text-xs text-[var(--color-text-muted)]">
          <span className="text-[var(--color-queue-macro)]">Macrotasks</span>: setTimeout, setInterval, I/O
        </div>
      </CardContent>
    </Card>
  )
}
