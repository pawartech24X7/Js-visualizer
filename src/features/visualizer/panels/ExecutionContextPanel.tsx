import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { useState } from 'react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-purple)]" />
          Execution Context
        </CardTitle>
        <Tooltip content="The environment where JavaScript code is evaluated and executed. It contains the variable environment, lexical environment, and 'this' binding.">
          <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
        </Tooltip>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
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

  // Access bindings from EnvironmentRecord (after refactoring)
  const varEnvEntries = Object.entries(context.variableEnvironment.bindings)
  const lexEnvEntries = Object.entries(context.lexicalEnvironment.bindings)

  // Find outer environment variables (Closures vs Global)
  const closureEntries: { name: string, value: RuntimeValue, contextName: string }[] = []
  const globalEntries: { name: string, value: RuntimeValue }[] = []

  // Traverse through lexical environment chain instead of outerEnvironmentRef
  let outerEnv = context.lexicalEnvironment.outer
  while (outerEnv) {
    // Collect variables from outer environments - use non-null assertion since while loop checks
  Object.entries(outerEnv!.bindings).forEach(([name, value]) => {
      // Check if this is a global environment
   if (outerEnv!.type === 'global') {
     if (!globalEntries.find(e => e.name === name)) {
          globalEntries.push({ name, value })
        }
      } else {
        // Closure variables from function/block environments
     if (!closureEntries.find(e => e.name === name) && !lexEnvEntries.find(e => e[0] === name)) {
          closureEntries.push({ 
            name, 
            value, 
        contextName: outerEnv!.type === 'function' ? 'Function' : 'Block' 
          })
        }
      }
    })
    
  outerEnv = outerEnv!.outer
  }

  const contextTooltip = context.type === 'global'
    ? "Global Execution Context (GEC): This is where JavaScript code starts running. Global variables and functions are stored here."
    : "Function Execution Context (FEC): Created whenever a function is called. It has its own variables and execution flow."

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
      <div className="flex items-center justify-between bg-[var(--color-bg-secondary)]/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-2 flex items-center gap-2 hover:bg-[var(--color-bg-secondary)]/50 transition-colors text-left"
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
        <Tooltip content={contextTooltip}>
          <div className="p-2 pr-3 cursor-help">
            <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </div>
        </Tooltip>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 space-y-3">
          {/* Variable Environment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                Variable Environment
                <Tooltip content="Variable Environment: Stores variables declared with var and function declarations.">
                  <Info className="w-3 h-3 cursor-help" />
                </Tooltip>
              </div>
            </div>
            {varEnvEntries.length > 0 ? (
              <div className="space-y-1">
                {varEnvEntries.map(([name, value]) => (
                  <VariableRow key={name} name={name} value={value} />
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-[var(--color-text-muted)] italic px-2">No var declarations</div>
            )}
          </div>

          {/* Lexical Environment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                Lexical Environment
                <Tooltip content="Lexical Environment: Stores variables declared using let and const. It also handles block scope.">
                  <Info className="w-3 h-3 cursor-help" />
                </Tooltip>
              </div>
            </div>
            {lexEnvEntries.length > 0 ? (
              <div className="space-y-1">
                {lexEnvEntries.map(([name, value]) => (
                  <VariableRow key={name} name={name} value={value} />
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-[var(--color-text-muted)] italic px-2">No let/const declarations</div>
            )}
          </div>

          {/* Closure / Outer Lexical Environment */}
          {closureEntries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-[var(--color-accent-blue)] flex items-center gap-1.5">
                  Outer Lexical Environment (Closure)
                  <Tooltip content="Closure: Variables from outer scopes that are preserved because this function references them.">
                    <Info className="w-3 h-3 cursor-help" />
                  </Tooltip>
                </div>
              </div>
              <div className="space-y-1 border-l-2 border-[var(--color-accent-blue)]/30 pl-2">
                {closureEntries.map((entry) => (
                  <VariableRow
                    key={`${entry.contextName}-${entry.name}`}
                    name={entry.name}
                    value={entry.value}
                    contextName={entry.contextName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Global Lexical Environment */}
          {globalEntries.length > 0 && context.type !== 'global' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-[var(--color-accent-orange)] flex items-center gap-1.5">
                  Global Lexical Environment
                  <Tooltip content="Global: Variables that are accessible everywhere. These are at the top of the scope chain.">
                    <Info className="w-3 h-3 cursor-help" />
                  </Tooltip>
                </div>
              </div>
              <div className="space-y-1 border-l-2 border-[var(--color-accent-orange)]/30 pl-2">
                {globalEntries.map((entry) => (
                  <VariableRow
                    key={`global-${entry.name}`}
                    name={entry.name}
                    value={entry.value}
                  />
                ))}
              </div>
            </div>
          )}

          {/* this binding */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                this Binding
                <Tooltip content="This Binding: Represents the value of 'this' inside the current execution context.">
                  <Info className="w-3 h-3 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <div className="font-mono text-xs bg-[var(--color-bg-primary)] px-2 py-1 rounded border border-[var(--color-border)]">
              <span className="text-[var(--color-accent-cyan)]">this</span>
              <span className="text-[var(--color-text-muted)]"> = </span>
              <span className="text-[var(--color-text-primary)]">
                {context.thisBinding.type === 'undefined'
                  ? 'undefined (strict mode)'
                  : formatValue(context.thisBinding)}
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
  contextName?: string
}

function VariableRow({ name, value, contextName }: VariableRowProps) {
  return (
    <div className="font-mono text-[10px] bg-[var(--color-bg-primary)] px-2 py-0.5 rounded flex items-center group">
      <span className="text-[var(--color-accent-blue)]">{name}</span>
      {contextName && (
        <span className="text-[8px] text-[var(--color-text-muted)] ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          ({contextName})
        </span>
      )}
      <span className="text-[var(--color-text-muted)] mx-1">=</span>
      <span className={getValueColor(value?.type)}>{formatValue(value)}</span>
    </div>
  )
}

function formatValue(value: RuntimeValue): string {
  if (value?.type === 'undefined') return 'undefined'
  if (value?.type === 'null') return 'null'
  if (value?.type === 'string') return `"${value.value}"`
  if (value?.type === 'boolean') return String(value.value)
  if (value?.type === 'number') return String(value.value)
  if (value?.type === 'function') return `ƒ ${value.value || 'anonymous'}`
  if (value?.type === 'object') return '{...}'
  if (value?.type === 'array') return '[...]'
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
