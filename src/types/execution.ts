import type { Node } from 'acorn'

export type EventLoopPhase =
  | 'idle'
  | 'executing-sync'
  | 'checking-microtasks'
  | 'executing-microtask'
  | 'checking-macrotasks'
  | 'executing-macrotask'

export type ExecutionPhase = 'creation' | 'execution' | 'async'

export type PromiseStatus = 'pending' | 'fulfilled' | 'rejected'

export type ExecutionAction =
  | 'declare-variable'
  | 'assign-variable'
  | 'read-variable'
  | 'call-function'
  | 'return-function'
  | 'create-object'
  | 'create-array'
  | 'create-function'
  | 'schedule-timeout'
  | 'schedule-interval'
  | 'create-promise'
  | 'resolve-promise'
  | 'reject-promise'
  | 'enqueue-microtask'
  | 'enqueue-macrotask'
  | 'dequeue-microtask'
  | 'dequeue-macrotask'
  | 'event-loop-tick'
  | 'console-log'
  | 'push-context'
  | 'pop-context'
  | 'hoisting'
  | 'expression-eval'

export interface StackFrame {
  id: string
  functionName: string
  line: number
  column: number
  executionContextId: string
  arguments: RuntimeValue[]
}

export interface ExecutionContext {
  id: string
  type: 'global' | 'function' | 'block'
  name: string
  parentId: string | null
  variableEnvironment: Record<string, RuntimeValue>
  lexicalEnvironment: Record<string, RuntimeValue>
  thisBinding: RuntimeValue
  outerEnvironmentRef: string | null
  hoistedDeclarations: string[]
}

export interface RuntimeValue {
  type:
    | 'undefined'
    | 'null'
    | 'boolean'
    | 'number'
    | 'string'
    | 'object'
    | 'array'
    | 'function'
    | 'reference'
  value: unknown
  heapId?: string
  label?: string
  isReturn?: boolean // New property to signal return from function
}

export interface MemorySlot {
  id: string
  variableName: string
  scopeId: string
  type: 'primitive' | 'reference'
  value: RuntimeValue
  heapReferenceId?: string
}

export interface HeapObject {
  id: string
  type: 'object' | 'array' | 'function'
  properties: Record<string, RuntimeValue>
  arrayElements?: RuntimeValue[]
  functionName?: string
  functionParams?: string[]
  functionBody?: string
  functionAst?: any // Add this to store function node for execution
  closureContextId?: string | null // Reference to parent scope
  referenceCount: number
  createdAtStep: number
}

export interface WebApiTask {
  id: string
  apiName: 'setTimeout' | 'setInterval' | 'fetch' | 'addEventListener'
  callbackId: string
  callbackName: string
  delay: number
  startTime: number
  remainingTime: number
  status: 'pending' | 'ready' | 'completed'
  createdAtStep: number
}

export interface MicroTask {
  id: string
  type: 'promise-then' | 'promise-catch' | 'promise-finally' | 'queueMicrotask'
  callbackName: string
  promiseId?: string
  createdAtStep: number
}

export interface MacroTask {
  id: string
  type: 'setTimeout' | 'setInterval' | 'setImmediate' | 'I/O'
  callbackName: string
  webApiTaskId?: string
  createdAtStep: number
}

export interface PromiseState {
  id: string
  label: string
  status: PromiseStatus
  value?: RuntimeValue
  reason?: RuntimeValue
  thenHandlers: string[]
  catchHandlers: string[]
  finallyHandlers: string[]
  createdAtStep: number
  resolvedAtStep?: number
}

export interface ConsoleEntry {
  id: string
  type: 'log' | 'info' | 'warn' | 'error' | 'debug'
  args: RuntimeValue[]
  timestamp: number
  stepNumber: number
}

export interface ExecutionStep {
  stepNumber: number
  timestamp: number
  phase: ExecutionPhase
  action: ExecutionAction
  description: string
  currentNode: Node | null
  currentLine: number
  currentColumn: number
  highlightRange?: { start: number; end: number }
  callStack: StackFrame[]
  executionContexts: ExecutionContext[]
  activeContextId: string
  memoryStack: MemorySlot[]
  memoryHeap: HeapObject[]
  webApis: WebApiTask[]
  microTaskQueue: MicroTask[]
  taskQueue: MacroTask[]
  promises: PromiseState[]
  consoleOutput: ConsoleEntry[]
  eventLoopPhase: EventLoopPhase
}

export interface ExecutionError {
  type: 'SyntaxError' | 'ReferenceError' | 'TypeError' | 'RangeError' | 'Error'
  message: string
  line?: number
  column?: number
}

export interface ParsedCode {
  ast: Node
  sourceCode: string
  lines: string[]
}
