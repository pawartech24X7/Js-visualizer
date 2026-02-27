import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'

export function MicroTaskQueuePanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const microTasks = currentStep?.microTaskQueue || []
  const isProcessing = currentStep?.eventLoopPhase === 'executing-microtask'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-queue-micro)]" />
          Microtask Queue
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {microTasks.length} pending
          </span>
          <Tooltip content="Microtask Queue: Stores callbacks from Promises and MutationObserver. These run immediately after the current script and before the next task.">
            <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
        {microTasks.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Queue is empty
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {microTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`
                    p-3 rounded-lg border
                    ${index === 0 && isProcessing
                      ? 'border-[var(--color-queue-micro)] bg-[var(--color-queue-micro)]/10 ring-2 ring-[var(--color-queue-micro)]/30'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">#{index + 1}</span>
                    <span className="font-mono text-sm text-[var(--color-queue-micro)]">
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
        
        {/* Priority indicator */}
        <div className="mt-4 p-2 bg-[var(--color-bg-tertiary)] rounded text-xs text-[var(--color-text-muted)]">
          <span className="text-[var(--color-queue-micro)]">Microtasks</span> have higher priority than macrotasks
        </div>
      </CardContent>
    </Card>
  )
}
