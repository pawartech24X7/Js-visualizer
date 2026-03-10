import type { Node } from 'acorn'

export type EventLoopPhase =
  | 'idle'
  | 'executing-sync'
  | 'checking-microtasks'
  | 'executing-microtask'
  | 'checking-macrotasks'
  | 'executing-macrotask'

export type ExecutionPhase = 'creation' | 'execution' | 'async' | 'expression-eval'

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
  | 'call-webapi'

export interface StackFrame {
  id: string
  functionName: string
  line: number
  column: number
  executionContextId: string
  arguments: RuntimeValue[]
}

export interface EnvironmentRecord {
  id: string
  type: 'global' | 'function' | 'block' | 'module'
  bindings: Record<string, RuntimeValue & { initialized?: boolean }> // Add TDZ tracking
  outer: EnvironmentRecord | null // Reference to outer lexical environment
}

export interface ExecutionContext {
  id: string
  type: 'global' | 'function' | 'block' | 'eval'
  name: string
  parentId: string | null
  variableEnvironment: EnvironmentRecord // For var declarations (hoisted)
  lexicalEnvironment: EnvironmentRecord // For let/const and scope chain
  thisBinding: RuntimeValue
  hoistedDeclarations: string[]
  tdzVariables: Set<string> // Track TDZ variables
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
  isAwait?: boolean // New property to signal await suspension
  isBreak?: boolean // New property to signal break from loop/switch
  isContinue?: boolean // New property to signal continue to next iteration
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
  functionAst?: Node // Add this to store function node for execution
  capturedEnvironment: EnvironmentRecord | null // Reference to captured lexical environment (closure)
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
  callbackAst?: any // Store the AST for callback execution
  callbackValue?: RuntimeValue // Store the actual function value
}

export interface MicroTask {
  id: string
  type: 'promise-then' | 'promise-catch' | 'promise-finally' | 'queueMicrotask'
  callbackName: string
  promiseId?: string // The ID of the promise this handler is attached to
  newPromiseId?: string // The ID of the new promise returned by .then()
  createdAtStep: number
  callbackAst?: any // Store the AST for callback execution
  callbackValue?: RuntimeValue // Store the actual function value
  // For async/await continuation
  isContinuation?: boolean
  remainingStatements?: any[]
  contextToResume?: string // Context ID
}

export interface MacroTask {
  id: string
  type: 'setTimeout' | 'setInterval' | 'setImmediate' | 'message-channel'
  callbackName: string
  webApiTaskId?: string
  createdAtStep: number
  callbackAst?: any // Store the AST for callback execution
  callbackValue?: RuntimeValue // Store the actual function value
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
