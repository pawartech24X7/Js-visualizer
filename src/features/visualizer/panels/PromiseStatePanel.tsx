import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'

export function PromiseStatePanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const promises = currentStep?.promises || []

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]" />
          Promises
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {promises.length} tracked
          </span>
          <Tooltip content="Promises represent the eventual completion (or failure) of an asynchronous operation and its resulting value.">
            <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
        {promises.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
            No promises created yet
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {promises.map((promise) => (
                <motion.div
                  key={promise.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`
                    p-3 rounded-lg border
                    ${promise.status === 'pending'
                      ? 'border-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)]'
                      : promise.status === 'fulfilled'
                      ? 'border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                      : 'border-[var(--color-accent-red)] bg-[var(--color-accent-red)]/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-[var(--color-text-primary)]">
                      {promise.label}
                    </span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${promise.status === 'pending'
                          ? 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                          : promise.status === 'fulfilled'
                          ? 'bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]'
                          : 'bg-[var(--color-accent-red)]/20 text-[var(--color-accent-red)]'
                        }
                      `}
                    >
                      {promise.status}
                    </motion.span>
                  </div>

                  {/* Value or Reason */}
                  {promise.status === 'fulfilled' && promise.value && (
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      Value:{' '}
                      <span className="font-mono text-[var(--color-accent-green)]">
                        {formatValue(promise.value)}
                      </span>
                    </div>
                  )}
                  
                  {promise.status === 'rejected' && promise.reason && (
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      Reason:{' '}
                      <span className="font-mono text-[var(--color-accent-red)]">
                        {formatValue(promise.reason)}
                      </span>
                    </div>
                  )}

                  {/* Handlers */}
                  {(promise.thenHandlers.length > 0 || promise.catchHandlers.length > 0) && (
                    <div className="mt-2 flex gap-2">
                      {promise.thenHandlers.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] rounded">
                          {promise.thenHandlers.length} .then()
                        </span>
                      )}
                      {promise.catchHandlers.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-accent-red)]/10 text-[var(--color-accent-red)] rounded">
                          {promise.catchHandlers.length} .catch()
                        </span>
                      )}
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
  return String(value.value)
}
