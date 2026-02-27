import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui'
import type { MemorySlot, HeapObject, RuntimeValue } from '@/types'

export function MemoryPanel() {
  const { executionSteps, currentStepIndex } = useExecutionStore()
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < executionSteps.length
    ? executionSteps[currentStepIndex]
    : null

  const memoryStack = currentStep?.memoryStack || []
  const memoryHeap = currentStep?.memoryHeap || []

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]" />
          Memory
        </CardTitle>
        <Tooltip content="Memory is where data is stored. The Stack is for primitive values and context data; the Heap is for large objects and functions.">
          <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)] cursor-help" />
        </Tooltip>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-2">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Stack */}
          <div>
            <div className="text-xs font-semibold text-[var(--color-stack)] mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-stack)]" />
                STACK
              </div>
              <Tooltip content="Stack: A small, fast memory region that stores primitive values (like numbers/strings) and function call frames.">
                <Info className="w-3 h-3 cursor-help text-[var(--color-text-muted)]" />
              </Tooltip>
            </div>
            <div className="space-y-1">
              <AnimatePresence>
                {memoryStack.length === 0 ? (
                  <div className="text-xs text-[var(--color-text-muted)] text-center py-2">
                    Empty
                  </div>
                ) : (
                  memoryStack.map((slot) => (
                    <StackSlot key={slot.id} slot={slot} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Heap */}
          <div>
            <div className="text-xs font-semibold text-[var(--color-heap)] mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-heap)]" />
                HEAP
              </div>
              <Tooltip content="Heap: A larger memory region where complex objects and arrays are stored. Variables on the stack 'point' to these objects.">
                <Info className="w-3 h-3 cursor-help text-[var(--color-text-muted)]" />
              </Tooltip>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {memoryHeap.length === 0 ? (
                  <div className="text-xs text-[var(--color-text-muted)] text-center py-2">
                    Empty
                  </div>
                ) : (
                  memoryHeap.map((obj) => (
                    <HeapObject key={obj.id} object={obj} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StackSlotProps {
  slot: MemorySlot
}

function StackSlot({ slot }: StackSlotProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded p-2"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--color-accent-blue)]">
          {slot.variableName}
        </span>
        {slot.heapReferenceId && (
          <span className="text-[10px] text-[var(--color-text-muted)]">
            → {slot.heapReferenceId.slice(-6)}
          </span>
        )}
      </div>
      <div className="font-mono text-xs mt-0.5">
        <span className={getValueColor(slot.value.type)}>
          {formatValue(slot.value)}
        </span>
      </div>
    </motion.div>
  )
}

interface HeapObjectProps {
  object: HeapObject
}

function HeapObject({ object }: HeapObjectProps) {
  const typeColors = {
    object: 'border-[var(--color-heap)]',
    array: 'border-[var(--color-accent-cyan)]',
    function: 'border-[var(--color-function)]',
  }

  const typeBgColors = {
    object: 'bg-[var(--color-heap)]/10',
    array: 'bg-[var(--color-accent-cyan)]/10',
    function: 'bg-[var(--color-function)]/10',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        rounded border-l-2 p-2
        ${typeColors[object.type]}
        ${typeBgColors[object.type]}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
          {object.id.slice(-8)}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {object.type}
        </span>
      </div>

      {object.type === 'function' && (
        <div className="font-mono text-xs text-[var(--color-function)]">
          ƒ {object.functionName}({object.functionParams?.join(', ')})
        </div>
      )}

      {object.type === 'array' && object.arrayElements && (
        <div className="font-mono text-xs text-[var(--color-text-primary)]">
          [{object.arrayElements.length} items]
        </div>
      )}

      {object.type === 'object' && (
        <div className="space-y-0.5">
          {Object.entries(object.properties).slice(0, 3).map(([key, value]) => (
            <div key={key} className="font-mono text-[10px]">
              <span className="text-[var(--color-text-secondary)]">{key}: </span>
              <span className={getValueColor(value.type)}>{formatValue(value)}</span>
            </div>
          ))}
          {Object.keys(object.properties).length > 3 && (
            <div className="text-[10px] text-[var(--color-text-muted)]">
              ...{Object.keys(object.properties).length - 3} more
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function formatValue(value: RuntimeValue): string {
  if (value.type === 'undefined') return 'undefined'
  if (value.type === 'null') return 'null'
  if (value.type === 'string') return `"${String(value.value).slice(0, 20)}${String(value.value).length > 20 ? '...' : ''}"`
  if (value.type === 'boolean') return String(value.value)
  if (value.type === 'number') return String(value.value)
  if (value.type === 'function') return `ƒ`
  if (value.type === 'object') return '{...}'
  if (value.type === 'array') return '[...]'
  return String(value.value)
}

function getValueColor(type: string): string {
  switch (type) {
    case 'string': return 'text-[var(--color-accent-green)]'
    case 'number': return 'text-[var(--color-accent-blue)]'
    case 'boolean': return 'text-[var(--color-accent-orange)]'
    case 'function': return 'text-[var(--color-function)]'
    case 'undefined':
    case 'null': return 'text-[var(--color-text-muted)]'
    default: return 'text-[var(--color-text-primary)]'
  }
}
