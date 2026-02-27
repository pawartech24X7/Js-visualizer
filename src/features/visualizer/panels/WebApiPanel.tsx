import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'

export function WebApiPanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const webApis = currentStep?.webApis || []

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)]" />
          Web APIs
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {webApis.length} active
          </span>
          <Tooltip content="Web APIs are features provided by the browser (like setTimeout or fetch) that run outside the main JS engine.">
            <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
        {webApis.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
            No active Web APIs
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {webApis.map((api) => (
                <motion.div
                  key={api.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`
                    p-3 rounded-lg border
                    ${api.status === 'pending'
                      ? 'border-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/10'
                      : api.status === 'ready'
                      ? 'border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] opacity-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-[var(--color-accent-orange)]">
                      {api.apiName}
                    </span>
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${api.status === 'pending'
                        ? 'bg-[var(--color-accent-orange)]/20 text-[var(--color-accent-orange)]'
                        : api.status === 'ready'
                        ? 'bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]'
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                      }
                    `}>
                      {api.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    Callback: <span className="font-mono text-[var(--color-text-primary)]">{api.callbackName}</span>
                  </div>
                  
                  {api.delay > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
                        <span>Timer</span>
                        <span>{api.remainingTime}ms / {api.delay}ms</span>
                      </div>
                      <div className="h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[var(--color-accent-orange)]"
                          initial={{ width: '100%' }}
                          animate={{ width: `${(api.remainingTime / api.delay) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
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
