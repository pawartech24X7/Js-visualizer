import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { ExecutionContext, RuntimeValue } from '@/types'

export function ExecutionContextPanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const contexts = currentStep?.executionContexts || []
  const activeContextId = currentStep?.activeContextId

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-purple)]" />
          Execution Context
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {contexts.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
            No execution context
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {contexts.map((ctx) => (
                <ContextItem
                  key={ctx.id}
                  context={ctx}
                  isActive={ctx.id === activeContextId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ContextItemProps {
  context: ExecutionContext
  isActive: boolean
}

function ContextItem({ context, isActive }: ContextItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const varEnvEntries = Object.entries(context.variableEnvironment)
  const lexEnvEntries = Object.entries(context.lexicalEnvironment)
  const hasVariables = varEnvEntries.length > 0 || lexEnvEntries.length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        rounded-lg border overflow-hidden
        ${isActive
          ? 'border-[var(--color-accent-purple)] bg-[var(--color-accent-purple)]/5'
          : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
        }
      `}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 flex items-center gap-2 hover:bg-[var(--color-bg-secondary)]/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        )}
        <span className={`
          text-sm font-medium
          ${context.type === 'global' ? 'text-[var(--color-accent-orange)]' : 'text-[var(--color-text-primary)]'}
        `}>
          {context.name}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] ml-auto">
          {context.type}
        </span>
      </button>

      {/* Content */}
      {isExpanded && hasVariables && (
        <div className="px-3 pb-3 space-y-2">
          {/* Variable Environment */}
          {varEnvEntries.length > 0 && (
            <div>
              <div className="text-xs text-[var(--color-text-muted)] mb-1">
                Variable Environment (var)
              </div>
              <div className="space-y-1">
                {varEnvEntries.map(([name, value]) => (
                  <VariableRow key={name} name={name} value={value} />
                ))}
              </div>
            </div>
          )}

          {/* Lexical Environment */}
          {lexEnvEntries.length > 0 && (
            <div>
              <div className="text-xs text-[var(--color-text-muted)] mb-1">
                Lexical Environment (let/const)
              </div>
              <div className="space-y-1">
                {lexEnvEntries.map(([name, value]) => (
                  <VariableRow key={name} name={name} value={value} />
                ))}
              </div>
            </div>
          )}

          {/* this binding */}
          <div>
            <div className="text-xs text-[var(--color-text-muted)] mb-1">
              this binding
            </div>
            <div className="font-mono text-xs bg-[var(--color-bg-primary)] px-2 py-1 rounded">
              <span className="text-[var(--color-accent-cyan)]">this</span>
              <span className="text-[var(--color-text-muted)]"> = </span>
              <span className="text-[var(--color-text-primary)]">
                {formatValue(context.thisBinding)}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface VariableRowProps {
  name: string
  value: RuntimeValue
}

function VariableRow({ name, value }: VariableRowProps) {
  return (
    <div className="font-mono text-xs bg-[var(--color-bg-primary)] px-2 py-1 rounded flex items-center">
      <span className="text-[var(--color-accent-blue)]">{name}</span>
      <span className="text-[var(--color-text-muted)] mx-1">=</span>
      <span className={getValueColor(value.type)}>{formatValue(value)}</span>
    </div>
  )
}

function formatValue(value: RuntimeValue): string {
  if (value.type === 'undefined') return 'undefined'
  if (value.type === 'null') return 'null'
  if (value.type === 'string') return `"${value.value}"`
  if (value.type === 'boolean') return String(value.value)
  if (value.type === 'number') return String(value.value)
  if (value.type === 'function') return `ƒ ${value.value || 'anonymous'}`
  if (value.type === 'object') return '{...}'
  if (value.type === 'array') return '[...]'
  return String(value.value)
}

function getValueColor(type: string): string {
  switch (type) {
    case 'string': return 'text-[var(--color-accent-green)]'
    case 'number': return 'text-[var(--color-accent-blue)]'
    case 'boolean': return 'text-[var(--color-accent-orange)]'
    case 'function': return 'text-[var(--color-accent-purple)]'
    case 'undefined':
    case 'null': return 'text-[var(--color-text-muted)]'
    default: return 'text-[var(--color-text-primary)]'
  }
}
