import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'
import type { EventLoopPhase } from '@/types'

const phaseLabels: Record<EventLoopPhase, string> = {
  'idle': 'Idle',
  'executing-sync': 'Executing Sync Code',
  'checking-microtasks': 'Checking Microtasks',
  'executing-microtask': 'Executing Microtask',
  'checking-macrotasks': 'Checking Macrotasks',
  'executing-macrotask': 'Executing Macrotask',
}

const phases: EventLoopPhase[] = [
  'executing-sync',
  'checking-microtasks',
  'executing-microtask',
  'checking-macrotasks',
  'executing-macrotask',
]

export function EventLoopAnimation() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const currentPhase = currentStep?.eventLoopPhase || 'idle'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: currentPhase !== 'idle' ? 360 : 0 }}
            transition={{ duration: 2, repeat: currentPhase !== 'idle' ? Infinity : 0, ease: 'linear' }}
            className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]"
          />
          Event Loop
        </CardTitle>
        <Tooltip content="The Event Loop is a constantly running process that monitors both the Call Stack and the Task Queue. It moves tasks from the queue to the stack when the stack is empty.">
          <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
        </Tooltip>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
        {/* Circular diagram */}
        <div className="relative w-48 h-48">
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: currentPhase !== 'idle' ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: currentPhase !== 'idle' ? Infinity : 0,
              }}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-xs font-medium text-center
                ${currentPhase === 'idle'
                  ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                  : 'bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)]'
                }
              `}
            >
              {currentPhase === 'idle' ? 'Idle' : 'Running'}
            </motion.div>
          </div>

          {/* Phase indicators */}
          {phases.map((phase, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180)
            const radius = 80
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            const isActive = phase === currentPhase

            return (
              <motion.div
                key={phase}
                className={`
                  absolute w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-medium
                  transition-colors duration-200
                  ${isActive
                    ? 'bg-[var(--color-accent-cyan)] text-white'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                  }
                `}
                style={{
                  left: `calc(50% + ${x}px - 20px)`,
                  top: `calc(50% + ${y}px - 20px)`,
                }}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
              >
                {index + 1}
              </motion.div>
            )
          })}
        </div>

        {/* Current phase description */}
        <div className="mt-4 text-center">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            {phaseLabels[currentPhase]}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[200px]">
            {getPhaseDescription(currentPhase)}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-stack)]" />
            <span className="text-[var(--color-text-muted)]">Call Stack</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-queue-micro)]" />
            <span className="text-[var(--color-text-muted)]">Microtasks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)]" />
            <span className="text-[var(--color-text-muted)]">Web APIs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-queue-macro)]" />
            <span className="text-[var(--color-text-muted)]">Macrotasks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getPhaseDescription(phase: EventLoopPhase): string {
  switch (phase) {
    case 'idle':
      return 'Waiting for code to execute'
    case 'executing-sync':
      return 'Running synchronous code on the call stack'
    case 'checking-microtasks':
      return 'Checking microtask queue for pending tasks'
    case 'executing-microtask':
      return 'Executing a microtask (Promise callback)'
    case 'checking-macrotasks':
      return 'Checking task queue for pending macrotasks'
    case 'executing-macrotask':
      return 'Executing a macrotask (setTimeout callback)'
    default:
      return ''
  }
}
