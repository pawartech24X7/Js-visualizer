import type {
  ExecutionStep,
  ExecutionContext,
  StackFrame,
  MemorySlot,
  HeapObject,
  RuntimeValue,
  WebApiTask,
  MicroTask,
  MacroTask,
  PromiseState,
  ConsoleEntry,
  EventLoopPhase,
  ExecutionPhase,
  ExecutionAction,
  EnvironmentRecord,
} from '@/types'
import * as acorn from 'acorn'
import type { Node, Program } from 'acorn'

let stepCounter = 0
let heapIdCounter = 0
let contextIdCounter = 0
let taskIdCounter = 0
let envIdCounter = 0
let currentMaxSteps = 1000

const DEFAULT_MAX_STEPS = 1000
const DEFAULT_MAX_RECURSION_DEPTH = 50
const DEFAULT_MAX_LOOP_ITERATIONS = 500

export interface InterpreterOptions {
  maxSteps?: number
  maxRecursionDepth?: number
  maxLoopIterations?: number
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function resetCounters(): void {
  stepCounter = 0
  heapIdCounter = 0
  contextIdCounter = 0
  taskIdCounter = 0
  envIdCounter = 0
  currentMaxSteps = DEFAULT_MAX_STEPS
}

interface InterpreterState {
  callStack: StackFrame[]
  executionContexts: ExecutionContext[]
  memoryStack: MemorySlot[]
  memoryHeap: HeapObject[]
  webApis: WebApiTask[]
  microTaskQueue: MicroTask[]
  taskQueue: MacroTask[]
  promises: PromiseState[]
  consoleOutput: ConsoleEntry[]
  eventLoopPhase: EventLoopPhase
  currentContextId: string
  virtualTime: number
}

// Helper function to get current context
function getCurrentContext(state: InterpreterState): ExecutionContext | null {
  return state.executionContexts.find((c) => c.id === state.currentContextId) || null
}

function createRuntimeValue(value: unknown): RuntimeValue {
  if (value === undefined) return { type: 'undefined', value: undefined }
  if (value === null) return { type: 'null', value: null }
  if (typeof value === 'boolean') return { type: 'boolean', value }
  if (typeof value === 'number') return { type: 'number', value }
  if (typeof value === 'string') return { type: 'string', value }
  if (Array.isArray(value)) return { type: 'array', value }
  if (typeof value === 'function') return { type: 'function', value: '[Function]' }
  if (typeof value === 'object') return { type: 'object', value }
  return { type: 'undefined', value: undefined }
}

function cloneState(state: InterpreterState): InterpreterState {
  // Deep clone environment to preserve state at this snapshot
  // But we need to maintain the reference structure (outer pointers)
  // This is tricky because JSON.parse(JSON.stringify) breaks references
  // and shallow copy shares mutations.

  // For the visualizer, we want a snapshot.
  // We can't easily clone the entire graph of environments perfectly.
  // But for simple closures, we just need to make sure bindings are snapshotted.

  const cloneEnv = (env: EnvironmentRecord): EnvironmentRecord => {
    // If outer exists, we should technically clone it too recursively?
    // No, because that would duplicate the chain.
    // The issue is that if we mutate outer env later, this snapshot sees it.

    // For a perfect time-travel debugger, we need structural sharing or full copy.
    // Let's do a shallow copy of bindings, which is what we have.
    // The problem in TEST 1 is likely that the captured environment in heap
    // is being mutated in place, and we are seeing the final state?
    // No, TEST 1 fails because it returns undefined, not because of visualization.

    return {
      ...env,
      bindings: { ...env.bindings },
    }
  }

  return {
    callStack: state.callStack.map((f) => ({ ...f, arguments: [...f.arguments] })),
    executionContexts: state.executionContexts.map((ctx) => ({
      ...ctx,
      variableEnvironment: cloneEnv(ctx.variableEnvironment),
      lexicalEnvironment: cloneEnv(ctx.lexicalEnvironment),
      hoistedDeclarations: [...ctx.hoistedDeclarations],
      tdzVariables: new Set(ctx.tdzVariables),
    })),
    memoryStack: state.memoryStack.map((s) => ({ ...s, value: { ...s.value } })),
    memoryHeap: state.memoryHeap.map((h) => ({
      ...h,
      properties: { ...h.properties },
      arrayElements: h.arrayElements ? [...h.arrayElements] : undefined,
      functionParams: h.functionParams ? [...h.functionParams] : undefined,
      capturedEnvironment: h.capturedEnvironment, // Use reference
    })),
    webApis: state.webApis.map((w) => ({ ...w })),
    microTaskQueue: state.microTaskQueue.map((m) => ({ ...m })),
    taskQueue: state.taskQueue.map((t) => ({ ...t })),
    promises: state.promises.map((p) => ({
      ...p,
      thenHandlers: [...p.thenHandlers],
      catchHandlers: [...p.catchHandlers],
      finallyHandlers: [...p.finallyHandlers],
    })),
    consoleOutput: state.consoleOutput.map((c) => ({ ...c, args: [...c.args] })),
    eventLoopPhase: state.eventLoopPhase,
    currentContextId: state.currentContextId,
    virtualTime: state.virtualTime,
  }
}

function createStep(
  state: InterpreterState,
  node: Node | null,
  phase: ExecutionPhase,
  action: ExecutionAction,
  description: string,
  line: number,
  column: number
): ExecutionStep {
  if (stepCounter >= currentMaxSteps) {
    throw new Error(`Execution limit reached: ${currentMaxSteps} steps`)
  }
  stepCounter++
  const clonedState = cloneState(state)

  // Use the same ID generation logic as interpret function if possible
  // but ensure it's consistent within the step
  return {
    stepNumber: stepCounter,
    timestamp: Date.now(),
    phase,
    action,
    description,
    currentNode: node,
    currentLine: line,
    currentColumn: column,
    callStack: clonedState.callStack,
    executionContexts: clonedState.executionContexts,
    activeContextId: state.currentContextId, // Use state instead of clonedState to be safe
    memoryStack: clonedState.memoryStack,
    memoryHeap: clonedState.memoryHeap,
    webApis: clonedState.webApis,
    microTaskQueue: clonedState.microTaskQueue,
    taskQueue: clonedState.taskQueue,
    promises: clonedState.promises,
    consoleOutput: clonedState.consoleOutput,
    eventLoopPhase: clonedState.eventLoopPhase,
  }
}

function createGlobalContext(): ExecutionContext {
  const globalEnv: EnvironmentRecord = {
    id: `env-global`,
    type: 'global',
    bindings: {},
    outer: null,
  }

  return {
    id: `ctx-global`,
    type: 'global',
    name: 'Global',
    parentId: null,
    variableEnvironment: globalEnv,
    lexicalEnvironment: globalEnv,
    thisBinding: { type: 'object', value: 'window' },
    hoistedDeclarations: [],
    tdzVariables: new Set(),
  }
}

function createFunctionContext(
  name: string,
  outerEnv: EnvironmentRecord | null,
  parentId: string | null
): ExecutionContext {
  contextIdCounter++

  // Create function-level lexical and variable environments
  const funcVarEnv: EnvironmentRecord = {
    id: `env-var-func-${contextIdCounter}`,
    type: 'function',
    bindings: {},
    outer: outerEnv, // Set captured environment as outer reference
  }

  const funcLexEnv: EnvironmentRecord = {
    id: `env-lex-func-${contextIdCounter}`,
    type: 'function',
    bindings: {},
    outer: outerEnv,
  }

  const ctx: ExecutionContext = {
    id: `ctx-${contextIdCounter}`,
    type: 'function',
    name,
    parentId, // Track parent
    variableEnvironment: funcVarEnv,
    lexicalEnvironment: funcLexEnv,
    thisBinding: { type: 'undefined', value: undefined },
    hoistedDeclarations: [],
    tdzVariables: new Set(),
  }

  return ctx
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any

export function interpret(sourceCode: string, options: InterpreterOptions = {}): ExecutionStep[] {
  resetCounters()
  const steps: ExecutionStep[] = []
  currentMaxSteps = options.maxSteps || DEFAULT_MAX_STEPS

  let ast: Program
  try {
    ast = acorn.parse(sourceCode, {
      ecmaVersion: 2022,
      sourceType: 'script',
      locations: true,
    }) as Program
  } catch (error) {
    const errorStep: ExecutionStep = {
      stepNumber: 1,
      timestamp: Date.now(),
      phase: 'creation',
      action: 'declare-variable',
      description: `Syntax Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      currentNode: null,
      currentLine: 1,
      currentColumn: 0,
      callStack: [],
      executionContexts: [],
      activeContextId: '',
      memoryStack: [],
      memoryHeap: [],
      webApis: [],
      microTaskQueue: [],
      taskQueue: [],
      promises: [],
      consoleOutput: [
        {
          id: generateId('console'),
          type: 'error',
          args: [
            {
              type: 'string',
              value: `${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          timestamp: Date.now(),
          stepNumber: 1,
        },
      ],
      eventLoopPhase: 'idle',
    }
    return [errorStep]
  }

  const globalContext = createGlobalContext()

  const state: InterpreterState = {
    callStack: [
      {
        id: generateId('frame'),
        functionName: 'Global',
        line: 1,
        column: 0,
        executionContextId: globalContext.id,
        arguments: [],
      },
    ],
    executionContexts: [globalContext],
    memoryStack: [],
    memoryHeap: [],
    webApis: [],
    microTaskQueue: [],
    taskQueue: [],
    promises: [],
    consoleOutput: [],
    eventLoopPhase: 'executing-sync',
    currentContextId: globalContext.id,
    virtualTime: 0,
  }

  try {
    // Initial step
    steps.push(
      createStep(state, ast, 'creation', 'push-context', 'Creating Global Execution Context', 1, 0)
    )

    // Creation phase - hoist declarations
    hoistDeclarations(ast, state, globalContext, steps)

    // Execution phase - execute statements
    for (const node of ast.body) {
      executeNode(node, state, steps, sourceCode)
    }

    // Process async tasks (event loop)
    processEventLoop(state, steps)
  } catch (error) {
    // Log the error to console
    const errorEntry: ConsoleEntry = {
      id: generateId('console'),
      type: 'error',
      args: [
        {
          type: 'string',
          value: `${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      timestamp: Date.now(),
      stepNumber: stepCounter + 1,
    }
    state.consoleOutput.push(errorEntry)

    // Add an error step
    steps.push(
      createStep(
        state,
        null,
        'execution',
        'event-loop-tick',
        `Runtime Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        1,
        0
      )
    )
  }

  // Final step - program complete
  state.callStack = []
  state.eventLoopPhase = 'idle'
  steps.push(
    createStep(
      state,
      null,
      'execution',
      'pop-context',
      'Program execution complete',
      ast.body.length > 0 ? getNodeLine(ast.body[ast.body.length - 1]) : 1,
      0
    )
  )

  return steps
}

function getNodeLine(node: AnyNode): number {
  return node.loc?.start?.line ?? 1
}

function getNodeColumn(node: AnyNode): number {
  return node.loc?.start?.column ?? 0
}

function hoistDeclarations(
  bodyNode: AnyNode,
  state: InterpreterState,
  context: ExecutionContext,
  steps: ExecutionStep[]
): void {
  if (!context || !bodyNode.body) return

  const nodes = Array.isArray(bodyNode.body) ? bodyNode.body : [bodyNode.body]
  const varEnv = context.variableEnvironment

  // PASS 1: Hoist all variable declarations (var, let, const)
  for (const node of nodes) {
    if (node.type === 'VariableDeclaration') {
      const varNode = node as AnyNode
      if (varNode.kind === 'var') {
        for (const decl of varNode.declarations) {
          const name = decl.id?.name || 'unknown'
          varEnv.bindings[name] = {
            type: 'undefined',
            value: undefined,
            initialized: true,
          }
          context.hoistedDeclarations.push(name)
          state.memoryStack.push({
            id: generateId('mem'),
            variableName: name,
            scopeId: context.id,
            type: 'primitive',
            value: { type: 'undefined', value: undefined },
          })
        }
      } else if (varNode.kind === 'let' || varNode.kind === 'const') {
        for (const decl of varNode.declarations) {
          const name = decl.id?.name || 'unknown'
          context.lexicalEnvironment.bindings[name] = {
            type: 'undefined',
            value: undefined,
            initialized: false,
          }
          context.hoistedDeclarations.push(name)
        }
      }
    }
  }

  // PASS 2: Hoist all function declarations (and capture the environment with variables)
  for (const node of nodes) {
    if (node.type === 'FunctionDeclaration') {
      const funcNode = node as AnyNode
      const name = funcNode.id?.name || 'anonymous'

      heapIdCounter++
      const heapId = `heap-${heapIdCounter}`
      const funcHeapObj: HeapObject = {
        id: heapId,
        type: 'function',
        properties: {},
        functionName: name,
        functionParams: funcNode.params?.map((p: AnyNode) => p.name) || [],
        functionBody: 'function body',
        functionAst: funcNode.body,
        capturedEnvironment: context.lexicalEnvironment,
        referenceCount: 1,
        createdAtStep: stepCounter,
      }
      state.memoryHeap.push(funcHeapObj)

      varEnv.bindings[name] = {
        type: 'function',
        value: name,
        heapId,
        initialized: true,
      }
      context.hoistedDeclarations.push(name)

      state.memoryStack.push({
        id: generateId('mem'),
        variableName: name,
        scopeId: context.id,
        type: 'reference',
        value: { type: 'function', value: name, heapId },
        heapReferenceId: heapId,
      })

      steps.push(
        createStep(
          state,
          node,
          'creation',
          'hoisting',
          `Hoisting function declaration: ${name}`,
          getNodeLine(node),
          getNodeColumn(node)
        )
      )
    }
  }
}

function executeNode(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const context = state.executionContexts.find((c) => c.id === state.currentContextId)
  if (!context) return { type: 'undefined', value: undefined }

  switch (node.type) {
    case 'VariableDeclaration':
      return executeVariableDeclaration(node, state, steps, context)

    case 'ExpressionStatement':
      return executeNode(node.expression, state, steps, sourceCode)

    case 'CallExpression':
      return executeCallExpression(node, state, steps, sourceCode)

    case 'FunctionDeclaration':
      // Already hoisted, skip
      return { type: 'undefined', value: undefined }

    case 'AssignmentExpression':
      if (node.left.type === 'MemberExpression') {
        return executeMemberAssignment(node, state, steps, sourceCode)
      }
      return executeAssignment(node, state, steps, context)

    case 'BinaryExpression':
      return evaluateBinaryExpression(node, state, steps, sourceCode)

    case 'Literal':
      return createRuntimeValue(node.value)

    case 'Identifier': {
      const result = resolveIdentifier(node.name, state)
      return result
    }

    case 'MemberExpression':
      return evaluateMemberExpression(node, state, steps, sourceCode)

    case 'ObjectExpression':
      return createObjectExpression(node, state, steps)

    case 'ArrayExpression':
      return createArrayExpression(node, state, steps, sourceCode)

    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return createFunctionExpression(node, state, steps)

    case 'ReturnStatement':
      if (node.argument) {
        const result = executeNode(node.argument, state, steps, sourceCode)
        return { ...result, isReturn: true }
      }
      return { type: 'undefined', value: undefined, isReturn: true }

    case 'BreakStatement':
      return { type: 'undefined', value: undefined, isBreak: true }

    case 'ContinueStatement':
      return { type: 'undefined', value: undefined, isContinue: true }

    case 'IfStatement': {
      const result = executeIfStatement(node, state, steps, sourceCode)
      return result
    }

    case 'ForStatement':
      return executeForStatement(node, state, steps, sourceCode)

    case 'ForOfStatement':
      return executeForOfStatement(node, state, steps, sourceCode)

    case 'ForInStatement':
      return executeForInStatement(node, state, steps, sourceCode)

    case 'WhileStatement':
      return executeWhileStatement(node, state, steps, sourceCode)

    case 'TryStatement':
      return executeTryStatement(node, state, steps, sourceCode)

    case 'SwitchStatement':
      return executeSwitchStatement(node, state, steps, sourceCode)

    case 'AwaitExpression':
      return executeAwaitExpression(node, state, steps, sourceCode)

    case 'BlockStatement': {
      // CRITICAL FIX: Create new block-level lexical environment for let/const
      const context = getCurrentContext(state)
      if (context) {
        // Save current lexical environment
        const outerEnv = context.lexicalEnvironment

        // Create new block environment
        envIdCounter++
        const blockEnv: EnvironmentRecord = {
          id: `env-block-${envIdCounter}`,
          type: 'block',
          bindings: {},
          outer: outerEnv,
        }

        // Set as current lexical environment
        context.lexicalEnvironment = blockEnv

        steps.push(
          createStep(
            state,
            node,
            'execution',
            'create-object',
            'Creating block-level lexical environment',
            getNodeLine(node),
            getNodeColumn(node)
          )
        )

        let lastVal: RuntimeValue = { type: 'undefined', value: undefined }
        for (let i = 0; i < node.body.length; i++) {
          const stmt = node.body[i]
          lastVal = executeNode(stmt, state, steps, sourceCode)

          if (lastVal.isAwait) {
            // Handle await continuation
            taskIdCounter++
            const microtask: MicroTask = {
              id: `microtask-${taskIdCounter}`,
              type: 'promise-then',
              callbackName: 'async continuation',
              createdAtStep: stepCounter + 1,
              isContinuation: true,
              remainingStatements: node.body.slice(i + 1),
              contextToResume: context.id,
            }
            state.microTaskQueue.push(microtask)

            // Restore environment before suspending
            context.lexicalEnvironment = outerEnv
            return lastVal
          }

          if (lastVal.isReturn || lastVal.isBreak || lastVal.isContinue) {
            // Restore environment before returning, breaking or continuing
            context.lexicalEnvironment = outerEnv
            return lastVal
          }
        }

        // Destroy block environment when exiting block
        context.lexicalEnvironment = outerEnv
        return lastVal
      }

      // Fallback if no context
      let lastVal: RuntimeValue = { type: 'undefined', value: undefined }
      for (const stmt of node.body) {
        lastVal = executeNode(stmt, state, steps, sourceCode)
        if (lastVal.isReturn || lastVal.isBreak || lastVal.isContinue) return lastVal
      }
      return lastVal
    }

    case 'NewExpression':
      return executeNewExpression(node, state, steps, sourceCode)

    case 'ConditionalExpression': {
      const testVal = executeNode(node.test, state, steps, sourceCode)
      if (testVal.value) {
        return executeNode(node.consequent, state, steps, sourceCode)
      }
      return executeNode(node.alternate, state, steps, sourceCode)
    }

    case 'LogicalExpression':
      return evaluateLogicalExpression(node, state, steps, sourceCode)

    case 'UnaryExpression':
      return evaluateUnaryExpression(node, state, steps, sourceCode)

    case 'UpdateExpression':
      return evaluateUpdateExpression(node, state)

    default:
      return { type: 'undefined', value: undefined }
  }
}

function executeVariableDeclaration(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  context: ExecutionContext
): RuntimeValue {
  const kind = node.kind as 'var' | 'let' | 'const'

  for (const decl of node.declarations) {
    const name = decl.id?.name || 'unknown'
    let value: RuntimeValue = { type: 'undefined', value: undefined }

    if (decl.init) {
      value = executeNode(decl.init, state, steps, '')
    }

    // For var, update existing hoisted declaration
    if (kind === 'var') {
      const existingSlot = state.memoryStack.find(
        (s) => s.variableName === name && s.scopeId === context.id
      )
      if (existingSlot) {
        existingSlot.value = value
        existingSlot.type = value.heapId ? 'reference' : 'primitive'
        existingSlot.heapReferenceId = value.heapId
      }
      context.variableEnvironment.bindings[name] = value
    } else {
      // let/const go to lexical environment with TDZ tracking
      const isInitialized = decl.init !== null

      context.lexicalEnvironment.bindings[name] = {
        ...value,
        initialized: isInitialized,
      }

      if (!isInitialized) {
        context.tdzVariables.add(name)
      }

      state.memoryStack.push({
        id: generateId('mem'),
        variableName: name,
        scopeId: context.id,
        type: value.heapId ? 'reference' : 'primitive',
        value,
        heapReferenceId: value.heapId,
      })
    }

    const valueStr = formatValue(value)
    steps.push(
      createStep(
        state,
        node,
        'execution',
        'declare-variable',
        `${kind} ${name} = ${valueStr}`,
        getNodeLine(node),
        getNodeColumn(node)
      )
    )
  }

  return { type: 'undefined', value: undefined }
}

function executeFunction(
  funcValue: RuntimeValue,
  funcName: string,
  args: RuntimeValue[],
  state: InterpreterState,
  steps: ExecutionStep[],
  node: AnyNode | null,
  sourceCode: string
): RuntimeValue {
  if (funcValue.type !== 'function' || !funcValue.heapId)
    return { type: 'undefined', value: undefined }

  const heapObj = state.memoryHeap.find((h) => h.id === funcValue.heapId)
  if (!heapObj || !heapObj.functionAst) return { type: 'undefined', value: undefined }

  if (state.callStack.length >= DEFAULT_MAX_RECURSION_DEPTH) {
    throw new Error(`Maximum recursion depth reached: ${DEFAULT_MAX_RECURSION_DEPTH}`)
  }

  // Create new execution context with captured environment as outer
  const capturedEnv = heapObj.capturedEnvironment
  const newContext = createFunctionContext(funcName, capturedEnv, state.currentContextId)
  state.executionContexts.push(newContext)

  // Map parameters to arguments
  if (heapObj.functionParams) {
    heapObj.functionParams.forEach((paramName, index) => {
      const val = args[index] || { type: 'undefined', value: undefined }
      newContext.lexicalEnvironment.bindings[paramName] = { ...val, initialized: true }
      state.memoryStack.push({
        id: generateId('mem'),
        variableName: paramName,
        scopeId: newContext.id,
        type: val.heapId ? 'reference' : 'primitive',
        value: val,
        heapReferenceId: val.heapId,
      })
    })
  }

  // Push to call stack
  const frame: StackFrame = {
    id: generateId('frame'),
    functionName: funcName,
    line: node ? getNodeLine(node) : 1,
    column: node ? getNodeColumn(node) : 0,
    executionContextId: newContext.id,
    arguments: args,
  }
  state.callStack.push(frame)

  const prevContextId = state.currentContextId
  state.currentContextId = newContext.id

  // Hoist declarations inside function
  hoistDeclarations(heapObj.functionAst, state, newContext, steps)

  steps.push(
    createStep(
      state,
      node,
      node ? 'execution' : 'async',
      'call-function',
      `Calling function: ${funcName}(${args.map((a) => formatValue(a)).join(', ')})`,
      node ? getNodeLine(node) : 1,
      node ? getNodeColumn(node) : 0
    )
  )

  // Execute function body
  let result: RuntimeValue
  if (heapObj.functionAst.type === 'BlockStatement') {
    let lastVal: RuntimeValue = { type: 'undefined', value: undefined }
    const functionAst = heapObj.functionAst as any
    for (let i = 0; i < functionAst.body.length; i++) {
      const stmt = functionAst.body[i]
      lastVal = executeNode(stmt, state, steps, sourceCode)

      if (lastVal.isAwait) {
        // Handle await continuation
        taskIdCounter++
        const microtask: MicroTask = {
          id: `microtask-${taskIdCounter}`,
          type: 'promise-then',
          callbackName: 'async continuation',
          createdAtStep: stepCounter + 1,
          isContinuation: true,
          remainingStatements: functionAst.body.slice(i + 1),
          contextToResume: newContext.id,
        }
        state.microTaskQueue.push(microtask)

        // Return suspended
        state.callStack.pop()
        state.currentContextId = prevContextId
        return lastVal
      }

      if (lastVal.isReturn) break
    }
    result = lastVal
  } else {
    // Arrow function with expression body
    result = executeNode(heapObj.functionAst, state, steps, sourceCode)
    result = { ...result, isReturn: true }
  }

  if (result.isAwait) {
    // If we're inside an async function, we need to handle the continuation
    // But for now, we just stop synchronous execution of this function
    state.callStack.pop()
    state.currentContextId = prevContextId
    return result
  }

  // Unwrap return
  let finalResult = result
  if (result.isReturn) {
    finalResult = { ...result, isReturn: false }
  }

  // Pop from call stack and restore context
  state.callStack.pop()
  state.currentContextId = prevContextId

  steps.push(
    createStep(
      state,
      node,
      node ? 'execution' : 'async',
      'return-function',
      `Function ${funcName} returned ${formatValue(finalResult)}`,
      node ? getNodeLine(node) : 1,
      node ? getNodeColumn(node) : 0
    )
  )

  return finalResult
}

function executeCallExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  // Handle console.log, setTimeout, Promise, etc.
  if (node.callee.type === 'MemberExpression') {
    const objNode = node.callee.object
    const prop = node.callee.property
    const method = prop.name

    // Evaluate the object first
    const objValue = executeNode(objNode, state, steps, sourceCode)

    // Handle console.log
    if (objNode.type === 'Identifier' && objNode.name === 'console') {
      return executeConsoleMethod(node, method, state, steps, sourceCode)
    }

    // Handle Promise methods (resolve, reject, all, etc. on Promise constructor)
    if (objNode.type === 'Identifier' && objNode.name === 'Promise') {
      return executePromiseMethod(node, method, state, steps, sourceCode, null)
    }

    // Handle Promise instance methods (then, catch, finally)
    const isPromise =
      objValue.type === 'object' &&
      objValue.heapId &&
      state.memoryHeap.find((h) => h.id === objValue.heapId)?.properties['[[PromiseState]]']

    if (isPromise) {
      return executePromiseMethod(node, method, state, steps, sourceCode, objValue)
    }

    // Fallback for other member expression calls (methods on objects/arrays)
    // ...
  }

  // Handle setTimeout, setInterval
  if (node.callee.type === 'Identifier') {
    const name = node.callee.name

    if (name === 'setTimeout') {
      return executeSetTimeout(node, state, steps, sourceCode)
    }

    if (name === 'setInterval') {
      return executeSetTimeout(node, state, steps, sourceCode)
    }

    if (name === 'Promise') {
      return executePromiseConstructor(node, state, steps, sourceCode)
    }
  }

  // Regular function call
  const calleeNode = node.callee
  let funcName = 'anonymous'
  let funcValue: RuntimeValue = { type: 'undefined', value: undefined }

  if (calleeNode.type === 'Identifier') {
    funcName = calleeNode.name
    funcValue = resolveIdentifier(funcName, state)
  } else if (calleeNode.type === 'MemberExpression') {
    funcName = calleeNode.property.name || 'method'
    funcValue = evaluateMemberExpression(calleeNode, state, steps, sourceCode)
  } else {
    funcValue = executeNode(calleeNode, state, steps, sourceCode)
  }

  // Evaluate arguments
  const args: RuntimeValue[] = node.arguments.map((arg: AnyNode) =>
    executeNode(arg, state, steps, sourceCode)
  )

  return executeFunction(funcValue, funcName, args, state, steps, node, sourceCode)
}

function executeConsoleMethod(
  node: AnyNode,
  method: string,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const args: RuntimeValue[] = node.arguments.map((arg: AnyNode) =>
    executeNode(arg, state, steps, sourceCode)
  )

  const consoleType =
    method === 'error' ? 'error' : method === 'warn' ? 'warn' : method === 'info' ? 'info' : 'log'

  const entry: ConsoleEntry = {
    id: generateId('console'),
    type: consoleType,
    args,
    timestamp: Date.now(),
    stepNumber: stepCounter + 1,
  }
  state.consoleOutput.push(entry)

  const argsStr = args.map((a) => formatValue(a)).join(', ')
  steps.push(
    createStep(
      state,
      node,
      'execution',
      'console-log',
      `console.${method}(${argsStr})`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'undefined', value: undefined }
}

function executeSetTimeout(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const callbackNode = node.arguments[0]
  const delayNode = node.arguments[1]

  const callbackValue = executeNode(callbackNode, state, steps, sourceCode)
  const delay = delayNode ? executeNode(delayNode, state, steps, sourceCode).value : 0

  const callbackName =
    callbackNode.type === 'Identifier'
      ? callbackNode.name
      : callbackNode.type === 'ArrowFunctionExpression' ||
          callbackNode.type === 'FunctionExpression'
        ? 'anonymous'
        : 'callback'

  // Add to Web APIs
  taskIdCounter++
  const webApiTaskId = `webapi-${taskIdCounter}`
  const webApi: WebApiTask = {
    id: webApiTaskId,
    apiName: 'setTimeout',
    status: 'pending',
    delay: Number(delay),
    startTime: Date.now(),
    remainingTime: Number(delay),
    createdAtStep: stepCounter + 1,
    callbackId: `callback-${taskIdCounter}`,
    callbackName,
    callbackAst: callbackNode, // Keep for visualization
    callbackValue, // Store the actual function value
  }
  state.webApis.push(webApi)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'call-webapi',
      `setTimeout queued: ${callbackName} in ${delay}ms`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'number', value: taskIdCounter }
}

function executePromiseConstructor(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  _sourceCode: string
): RuntimeValue {
  taskIdCounter++
  const promiseId = `promise-${taskIdCounter}`

  const promise: PromiseState = {
    id: promiseId,
    label: `Promise #${taskIdCounter}`,
    status: 'pending',
    thenHandlers: [],
    catchHandlers: [],
    finallyHandlers: [],
    createdAtStep: stepCounter + 1,
  }
  state.promises.push(promise)

  heapIdCounter++
  const heapId = `heap-${heapIdCounter}`
  const promiseHeap: HeapObject = {
    id: heapId,
    type: 'object',
    properties: {
      '[[PromiseState]]': { type: 'string', value: 'pending' },
      '[[PromiseResult]]': { type: 'undefined', value: undefined },
    },
    referenceCount: 1,
    createdAtStep: stepCounter + 1,
    capturedEnvironment: null, // Promises don't capture environment
  }
  state.memoryHeap.push(promiseHeap)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'create-promise',
      `new Promise() created (pending)`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  // Simulate immediate resolution for demo purposes
  promise.status = 'fulfilled'
  promise.value = { type: 'string', value: 'resolved' }
  promise.resolvedAtStep = stepCounter + 1

  steps.push(
    createStep(
      state,
      node,
      'async',
      'resolve-promise',
      `Promise resolved`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'object', value: 'Promise', heapId }
}

function executePromiseMethod(
  node: AnyNode,
  method: string,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string,
  objValue: RuntimeValue | null
): RuntimeValue {
  if (method === 'resolve') {
    const value: RuntimeValue = node.arguments[0]
      ? executeNode(node.arguments[0], state, steps, sourceCode)
      : { type: 'undefined', value: undefined }

    taskIdCounter++
    const promiseId = `promise-${taskIdCounter}`

    const promise: PromiseState = {
      id: promiseId,
      label: `Promise.resolve`,
      status: 'fulfilled',
      value,
      thenHandlers: [],
      catchHandlers: [],
      finallyHandlers: [],
      createdAtStep: stepCounter + 1,
      resolvedAtStep: stepCounter + 1,
    }
    state.promises.push(promise)

    steps.push(
      createStep(
        state,
        node,
        'execution',
        'create-promise',
        `Promise.resolve(${formatValue(value)})`,
        getNodeLine(node),
        getNodeColumn(node)
      )
    )

    heapIdCounter++
    const heapId = `heap-${heapIdCounter}`
    const promiseHeap: HeapObject = {
      id: heapId,
      type: 'object',
      properties: {
        '[[PromiseState]]': { type: 'string', value: 'fulfilled' } as RuntimeValue,
        '[[PromiseResult]]': value,
        '[[PromiseId]]': { type: 'string', value: promiseId },
      },
      referenceCount: 1,
      createdAtStep: stepCounter,
      capturedEnvironment: null,
    }
    state.memoryHeap.push(promiseHeap)

    return { type: 'object', value: 'Promise', heapId }
  }

  if (method === 'then') {
    const callbackNode = node.arguments[0]

    // Get the actual promise state from our internal promises array
    // by looking for the one that corresponds to this heap object
    const heapObj = state.memoryHeap.find((h) => h.id === objValue?.heapId)
    const originalPromiseId = heapObj?.properties['[[PromiseId]]']?.value as string
    const promiseState = state.promises.find((p) => p.id === originalPromiseId)

    // Return a new promise for chaining
    taskIdCounter++
    const newPromiseId = `promise-${taskIdCounter}`
    const newPromise: PromiseState = {
      id: newPromiseId,
      label: `${promiseState?.label || 'Promise'}.then()`,
      status: 'pending',
      thenHandlers: [],
      catchHandlers: [],
      finallyHandlers: [],
      createdAtStep: stepCounter + 1,
    }
    state.promises.push(newPromise)

    if (callbackNode) {
      const callbackValue = executeNode(callbackNode, state, steps, sourceCode)
      const callbackName =
        callbackNode.type === 'Identifier'
          ? callbackNode.name
          : callbackNode.type === 'ArrowFunctionExpression' ||
              callbackNode.type === 'FunctionExpression'
            ? 'anonymous'
            : 'callback'

      // Queue microtask
      taskIdCounter++
      const microtask: MicroTask = {
        id: `microtask-${taskIdCounter}`,
        type: 'promise-then',
        callbackName,
        promiseId: promiseState?.id,
        newPromiseId, // Store the ID of the promise this handler will resolve
        createdAtStep: stepCounter + 1,
        callbackAst: callbackNode,
        callbackValue,
      }
      state.microTaskQueue.push(microtask)

      steps.push(
        createStep(
          state,
          node,
          'async',
          'enqueue-microtask',
          `.then() handler "${callbackName}" queued as microtask`,
          getNodeLine(node),
          getNodeColumn(node)
        )
      )
    }

    heapIdCounter++
    const heapId = `heap-${heapIdCounter}`
    const promiseHeap: HeapObject = {
      id: heapId,
      type: 'object',
      properties: {
        '[[PromiseState]]': { type: 'string', value: 'pending' } as RuntimeValue,
        '[[PromiseResult]]': { type: 'undefined', value: undefined },
        '[[PromiseId]]': { type: 'string', value: newPromiseId },
      },
      referenceCount: 1,
      createdAtStep: stepCounter,
      capturedEnvironment: null,
    }
    state.memoryHeap.push(promiseHeap)

    return { type: 'object', value: 'Promise', heapId }
  }

  return { type: 'undefined', value: undefined }
}

function executeMemberAssignment(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const obj = executeNode(node.left.object, state, steps, sourceCode)
  const prop = node.left.computed
    ? executeNode(node.left.property, state, steps, sourceCode)
    : { type: 'string', value: node.left.property.name }
  const value = executeNode(node.right, state, steps, sourceCode)

  if (obj.heapId) {
    const heapObj = state.memoryHeap.find((h) => h.id === obj.heapId)
    if (heapObj) {
      const key = String(prop.value)
      if (heapObj.type === 'array' && heapObj.arrayElements) {
        const index = parseInt(key, 10)
        if (!isNaN(index) && index >= 0) {
          heapObj.arrayElements[index] = value
          // Update length if needed
          if (index >= (heapObj.properties.length.value as number)) {
            heapObj.properties.length = { type: 'number', value: index + 1 }
          }
        }
      } else {
        heapObj.properties[key] = value
      }

      steps.push(
        createStep(
          state,
          node,
          'execution',
          'assign-variable',
          `${formatValue(obj)}.${key} = ${formatValue(value)}`,
          getNodeLine(node),
          getNodeColumn(node)
        )
      )
    }
  }

  return value
}

function executeAssignment(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  _context: ExecutionContext
): RuntimeValue {
  const name = node.left?.name || 'unknown'
  const rightValue = executeNode(node.right, state, steps, '')
  let value = rightValue

  // Handle +=, -=, etc.
  if (node.operator !== '=') {
    const current = resolveIdentifier(name, state)
    const leftVal = current.value as any
    const rightVal = rightValue.value as any

    let result: any
    switch (node.operator) {
      case '+=':
        result = leftVal + rightVal
        break
      case '-=':
        result = leftVal - rightVal
        break
      case '*=':
        result = leftVal * rightVal
        break
      case '/=':
        result = leftVal / rightVal
        break
      default:
        result = rightVal
    }
    value = createRuntimeValue(result)
  }

  // Update in environment - search up closure chain through lexical environments
  const context = getCurrentContext(state)
  let found = false
  if (context) {
    let currentEnv: EnvironmentRecord | null = context.lexicalEnvironment

    while (currentEnv) {
      if (name in currentEnv.bindings) {
        currentEnv.bindings[name] = { ...value, initialized: true }
        found = true
        break
      }

      // If we are in an iteration environment, we want to update the binding in the loopEnv
      // but only if it exists there. This allows 'i++' in a for loop to work correctly
      // while still capturing the iteration's value for closures.
      currentEnv = currentEnv.outer
    }
  }

  // If not found in closure chain, it might be a new global variable (simplified)
  if (!found) {
    const globalCtx = state.executionContexts.find((c) => c.type === 'global')
    if (globalCtx) {
      globalCtx.lexicalEnvironment.bindings[name] = { ...value, initialized: true }
    }
  }

  // Update memory slot
  let searchContextId: string | null = state.currentContextId
  while (searchContextId) {
    const slot = state.memoryStack.find(
      (s) => s.variableName === name && s.scopeId === searchContextId
    )
    if (slot) {
      slot.value = value
      slot.type = value.heapId ? 'reference' : 'primitive'
      slot.heapReferenceId = value.heapId
      break
    }
    const ctx = state.executionContexts.find((c) => c.id === searchContextId)
    searchContextId = ctx?.parentId || null
  }

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'assign-variable',
      `${name} ${node.operator} ${formatValue(rightValue)} → ${formatValue(value)}`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return value
}

function evaluateBinaryExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const left = executeNode(node.left, state, steps, sourceCode)
  const right = executeNode(node.right, state, steps, sourceCode)

  const leftVal = left.value as any
  const rightVal = right.value as any

  let result: unknown
  switch (node.operator) {
    case '+':
      result = leftVal + rightVal
      break
    case '-':
      result = leftVal - rightVal
      break
    case '*':
      result = leftVal * rightVal
      break
    case '/':
      result = leftVal / rightVal
      break
    case '%':
      result = leftVal % rightVal
      break
    case '===':
      result = leftVal === rightVal
      break
    case '!==':
      result = leftVal !== rightVal
      break
    case '==':
      result = leftVal == rightVal
      break
    case '!=':
      result = leftVal != rightVal
      break
    case '<':
      result = leftVal < rightVal
      break
    case '>':
      result = leftVal > rightVal
      break
    case '<=':
      result = leftVal <= rightVal
      break
    case '>=':
      result = leftVal >= rightVal
      break
    default:
      result = undefined
  }

  const runtimeResult = createRuntimeValue(result)

  steps.push(
    createStep(
      state,
      node,
      'expression-eval',
      'expression-eval',
      `${formatValue(left)} ${node.operator} ${formatValue(right)} → ${formatValue(runtimeResult)}`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return runtimeResult
}

function evaluateLogicalExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const left = executeNode(node.left, state, steps, sourceCode)

  if (node.operator === '&&') {
    if (!left.value) return left
    return executeNode(node.right, state, steps, sourceCode)
  }

  if (node.operator === '||') {
    if (left.value) return left
    return executeNode(node.right, state, steps, sourceCode)
  }

  if (node.operator === '??') {
    if (left.value !== null && left.value !== undefined) return left
    return executeNode(node.right, state, steps, sourceCode)
  }

  return { type: 'undefined', value: undefined }
}

function evaluateUnaryExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const arg = executeNode(node.argument, state, steps, sourceCode)

  switch (node.operator) {
    case '!':
      return { type: 'boolean', value: !arg.value }
    case '-':
      return { type: 'number', value: -(arg.value as number) }
    case '+':
      return { type: 'number', value: +(arg.value as number) }
    case 'typeof':
      return { type: 'string', value: typeof arg.value }
    default:
      return { type: 'undefined', value: undefined }
  }
}

function evaluateUpdateExpression(node: AnyNode, state: InterpreterState): RuntimeValue {
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  const name = node.argument?.name
  if (!name) return { type: 'undefined', value: undefined }

  const current = resolveIdentifier(name, state)
  const currentVal = Number(current.value)
  const newVal = node.operator === '++' ? currentVal + 1 : currentVal - 1

  // Update value - search up closure chain through lexical environments
  let currentEnv: EnvironmentRecord | null = context.lexicalEnvironment

  while (currentEnv) {
    if (name in currentEnv.bindings) {
      currentEnv.bindings[name] = { type: 'number', value: newVal, initialized: true }
      break
    }
    currentEnv = currentEnv.outer
  }

  // Update memory stack slot
  let searchContextId: string | null = state.currentContextId
  while (searchContextId) {
    const slot = state.memoryStack.find(
      (s) => s.variableName === name && s.scopeId === searchContextId
    )
    if (slot) {
      slot.value = { type: 'number', value: newVal }
      break
    }
    const ctx = state.executionContexts.find((c) => c.id === searchContextId)
    searchContextId = ctx?.parentId || null
  }

  return node.prefix ? { type: 'number', value: newVal } : { type: 'number', value: currentVal }
}

function resolveIdentifier(name: string, state: InterpreterState): RuntimeValue {
  // Get current context
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  // Search from current lexical environment up through outer chain
  let currentEnv: EnvironmentRecord | null = context.lexicalEnvironment

  while (currentEnv) {
    if (name in currentEnv.bindings) {
      const binding = currentEnv.bindings[name]

      // Check TDZ - variable must be initialized
      if (binding.initialized === false) {
        throw new ReferenceError(`Cannot access '${name}' before initialization`)
      }

      return binding
    }

    // Move to outer environment
    currentEnv = currentEnv.outer
  }

  // Fallback: check variable environment
  if (name in context.variableEnvironment.bindings) {
    return context.variableEnvironment.bindings[name]
  }

  // Fallback: check Global context explicitly if not in chain
  const globalCtx = state.executionContexts.find((c) => c.type === 'global')
  if (globalCtx && name in globalCtx.lexicalEnvironment.bindings) {
    return globalCtx.lexicalEnvironment.bindings[name]
  }
  if (globalCtx && name in globalCtx.variableEnvironment.bindings) {
    return globalCtx.variableEnvironment.bindings[name]
  }

  // Not found in scope chain
  return { type: 'undefined', value: undefined }
}

function evaluateMemberExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const obj = executeNode(node.object, state, steps, sourceCode)
  const prop = node.computed
    ? executeNode(node.property, state, steps, sourceCode)
    : { type: 'string', value: node.property.name }

  if (obj.heapId) {
    const heapObj = state.memoryHeap.find((h) => h.id === obj.heapId)
    if (heapObj) {
      const key = String(prop.value)
      if (heapObj.type === 'array' && heapObj.arrayElements) {
        const index = parseInt(key, 10)
        if (!isNaN(index) && index >= 0 && index < heapObj.arrayElements.length) {
          return heapObj.arrayElements[index]
        }
      }
      if (key in heapObj.properties) {
        return heapObj.properties[key]
      }
    }
  }

  return { type: 'undefined', value: undefined }
}

function createObjectExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[]
): RuntimeValue {
  heapIdCounter++
  const heapId = `heap-${heapIdCounter}`

  const properties: Record<string, RuntimeValue> = {}
  for (const prop of node.properties) {
    const key = prop.key.name || prop.key.value
    const value = executeNode(prop.value, state, steps, '')
    properties[key] = value
  }

  const heapObj: HeapObject = {
    id: heapId,
    type: 'object',
    properties,
    referenceCount: 1,
    createdAtStep: stepCounter + 1,
    capturedEnvironment: null, // Objects don't capture environment
  }
  state.memoryHeap.push(heapObj)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'create-object',
      `Creating object with ${Object.keys(properties).length} properties`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'object', value: '{...}', heapId }
}

function createArrayExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  heapIdCounter++
  const heapId = `heap-${heapIdCounter}`

  const elements: RuntimeValue[] = node.elements.map((el: AnyNode) =>
    el ? executeNode(el, state, steps, sourceCode) : { type: 'undefined', value: undefined }
  )

  const heapObj: HeapObject = {
    id: heapId,
    type: 'array',
    properties: { length: { type: 'number', value: elements.length } },
    arrayElements: elements,
    referenceCount: 1,
    createdAtStep: stepCounter + 1,
    capturedEnvironment: null, // Arrays don't capture environment
  }
  state.memoryHeap.push(heapObj)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'create-array',
      `Creating array with ${elements.length} elements`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'array', value: `[${elements.length} items]`, heapId }
}

function createFunctionExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[]
): RuntimeValue {
  heapIdCounter++
  const heapId = `heap-${heapIdCounter}`

  const name = node.id?.name || 'anonymous'
  const params = node.params?.map((p: AnyNode) => p.name) || []

  const heapObj: HeapObject = {
    id: heapId,
    type: 'function',
    properties: {},
    functionName: name,
    functionParams: params,
    functionBody: 'function body',
    functionAst: node.body,
    capturedEnvironment: null, // Will be set below - capture current lexical environment
    referenceCount: 1,
    createdAtStep: stepCounter + 1,
  }

  // Capture the LEXICAL ENVIRONMENT where function is defined
  const currentContext = getCurrentContext(state)
  if (currentContext) {
    heapObj.capturedEnvironment = currentContext.lexicalEnvironment
  }

  state.memoryHeap.push(heapObj)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'create-function',
      `Creating function: ${name}(${params.join(', ')})`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'function', value: name, heapId }
}

function executeIfStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const test = executeNode(node.test, state, steps, sourceCode)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'expression-eval',
      `if (${formatValue(test)}) → ${test.value ? 'true' : 'false'}`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  if (test.value) {
    return executeNode(node.consequent, state, steps, sourceCode)
  } else if (node.alternate) {
    return executeNode(node.alternate, state, steps, sourceCode)
  }

  return { type: 'undefined', value: undefined }
}

function executeForStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  // Create a block environment for the entire for loop
  const outerEnv = context.lexicalEnvironment
  envIdCounter++
  const loopEnv: EnvironmentRecord = {
    id: `env-loop-${envIdCounter}`,
    type: 'block',
    bindings: {},
    outer: outerEnv,
  }
  context.lexicalEnvironment = loopEnv

  // Initialize
  if (node.init) {
    executeNode(node.init, state, steps, sourceCode)
  }

  let iterations = 0
  const maxIterations = DEFAULT_MAX_LOOP_ITERATIONS // Use constant

  while (iterations < maxIterations) {
    // Create a new per-iteration environment
    envIdCounter++
    const iterationEnv: EnvironmentRecord = {
      id: `env-iteration-${envIdCounter}`,
      type: 'block',
      bindings: { ...loopEnv.bindings }, // Snapshot current values
      outer: loopEnv.outer,
    }
    context.lexicalEnvironment = iterationEnv

    // Test condition (runs on iterationEnv)
    if (node.test) {
      const test = executeNode(node.test, state, steps, sourceCode)
      if (!test.value) break
    }

    // Execute body (runs on iterationEnv)
    const result = executeNode(node.body, state, steps, sourceCode)

    // After body, update loopEnv with current iteration values
    Object.entries(iterationEnv.bindings).forEach(([name, val]) => {
      if (name in loopEnv.bindings) {
        loopEnv.bindings[name] = val
      }
    })

    // Restore to loopEnv for update
    context.lexicalEnvironment = loopEnv

    if (result.isBreak) break
    if (result.isContinue) {
      // Run update before continuing for-loop
      if (node.update) {
        executeNode(node.update, state, steps, sourceCode)
      }
      iterations++
      continue
    }
    if (result.isReturn || result.isAwait) {
      context.lexicalEnvironment = outerEnv
      return result
    }

    // Update (runs on loopEnv)
    if (node.update) {
      executeNode(node.update, state, steps, sourceCode)
    }

    iterations++
  }

  // Restore original environment
  context.lexicalEnvironment = outerEnv

  if (iterations >= maxIterations) {
    throw new Error(`Infinite loop detected: exceeded ${maxIterations} iterations`)
  }

  return { type: 'undefined', value: undefined }
}

function executeForOfStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  const right = executeNode(node.right, state, steps, sourceCode)
  let items: RuntimeValue[] = []

  if (right.type === 'array' && right.heapId) {
    const heapObj = state.memoryHeap.find((h) => h.id === right.heapId)
    if (heapObj && heapObj.arrayElements) {
      items = heapObj.arrayElements
    }
  } else if (right.type === 'string') {
    items = String(right.value)
      .split('')
      .map((char) => ({ type: 'string', value: char }))
  }

  const outerEnv = context.lexicalEnvironment
  let iterations = 0
  const maxIterations = DEFAULT_MAX_LOOP_ITERATIONS

  for (const item of items) {
    if (iterations >= maxIterations) break

    // Create a new block environment for each iteration
    envIdCounter++
    const iterationEnv: EnvironmentRecord = {
      id: `env-iteration-${envIdCounter}`,
      type: 'block',
      bindings: {},
      outer: outerEnv,
    }
    context.lexicalEnvironment = iterationEnv

    // Handle left side (e.g., let x of items)
    if (node.left.type === 'VariableDeclaration') {
      const decl = node.left.declarations[0]
      const name = decl.id.name
      iterationEnv.bindings[name] = { ...item, initialized: true }

      state.memoryStack.push({
        id: generateId('mem'),
        variableName: name,
        scopeId: context.id,
        type: item.heapId ? 'reference' : 'primitive',
        value: item,
        heapReferenceId: item.heapId,
      })
    } else if (node.left.type === 'Identifier') {
      const name = node.left.name
      // Update existing variable (though for-of usually uses let/const)
      let currentEnv: EnvironmentRecord | null = iterationEnv
      let found = false
      while (currentEnv) {
        if (name in currentEnv.bindings) {
          currentEnv.bindings[name] = { ...item, initialized: true }
          found = true
          break
        }
        currentEnv = currentEnv.outer
      }
      if (!found) {
        iterationEnv.bindings[name] = { ...item, initialized: true }
      }
    }

    // Execute body
    const result = executeNode(node.body, state, steps, sourceCode)
    if (result.isBreak) {
      context.lexicalEnvironment = outerEnv
      break
    }
    if (result.isContinue) {
      context.lexicalEnvironment = outerEnv
      iterations++
      continue
    }
    if (result.isReturn || result.isAwait) {
      context.lexicalEnvironment = outerEnv
      return result
    }

    iterations++
  }

  context.lexicalEnvironment = outerEnv
  if (iterations >= maxIterations) {
    throw new Error(`Infinite loop detected: exceeded ${maxIterations} iterations`)
  }

  return { type: 'undefined', value: undefined }
}

function executeForInStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  const right = executeNode(node.right, state, steps, sourceCode)
  let keys: string[] = []

  if (right.heapId) {
    const heapObj = state.memoryHeap.find((h) => h.id === right.heapId)
    if (heapObj) {
      keys = Object.keys(heapObj.properties)
    }
  }

  const outerEnv = context.lexicalEnvironment
  let iterations = 0
  const maxIterations = DEFAULT_MAX_LOOP_ITERATIONS

  for (const key of keys) {
    if (iterations >= maxIterations) break

    // Create a new block environment for each iteration
    envIdCounter++
    const iterationEnv: EnvironmentRecord = {
      id: `env-iteration-${envIdCounter}`,
      type: 'block',
      bindings: {},
      outer: outerEnv,
    }
    context.lexicalEnvironment = iterationEnv

    const keyValue: RuntimeValue = { type: 'string', value: key }

    // Handle left side
    if (node.left.type === 'VariableDeclaration') {
      const decl = node.left.declarations[0]
      const name = decl.id.name
      iterationEnv.bindings[name] = { ...keyValue, initialized: true }

      state.memoryStack.push({
        id: generateId('mem'),
        variableName: name,
        scopeId: context.id,
        type: 'primitive',
        value: keyValue,
      })
    } else if (node.left.type === 'Identifier') {
      const name = node.left.name
      iterationEnv.bindings[name] = { ...keyValue, initialized: true }
    }

    // Execute body
    const result = executeNode(node.body, state, steps, sourceCode)
    if (result.isBreak) {
      context.lexicalEnvironment = outerEnv
      break
    }
    if (result.isContinue) {
      context.lexicalEnvironment = outerEnv
      iterations++
      continue
    }
    if (result.isReturn || result.isAwait) {
      context.lexicalEnvironment = outerEnv
      return result
    }

    iterations++
  }

  context.lexicalEnvironment = outerEnv
  if (iterations >= maxIterations) {
    throw new Error(`Infinite loop detected: exceeded ${maxIterations} iterations`)
  }

  return { type: 'undefined', value: undefined }
}

function executeSwitchStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const discriminant = executeNode(node.discriminant, state, steps, sourceCode)
  let matched = false
  let defaultCase: any = null

  for (const caseNode of node.cases) {
    if (caseNode.test) {
      const testValue = executeNode(caseNode.test, state, steps, sourceCode)
      if (testValue.value === discriminant.value || matched) {
        matched = true
        for (const stmt of caseNode.consequent) {
          const result = executeNode(stmt, state, steps, sourceCode)
          if (result.isBreak) return { type: 'undefined', value: undefined }
          if (result.isReturn || result.isAwait) return result
        }
      }
    } else {
      defaultCase = caseNode
    }
  }

  if (!matched && defaultCase) {
    for (const stmt of defaultCase.consequent) {
      const result = executeNode(stmt, state, steps, sourceCode)
      if (result.isBreak) return { type: 'undefined', value: undefined }
      if (result.isReturn || result.isAwait) return result
    }
  }

  return { type: 'undefined', value: undefined }
}

function executeTryStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  try {
    return executeNode(node.block, state, steps, sourceCode)
  } catch (error) {
    if (node.handler) {
      // Create a block environment for catch
      const context = getCurrentContext(state)
      if (context) {
        const outerEnv = context.lexicalEnvironment
        envIdCounter++
        const catchEnv: EnvironmentRecord = {
          id: `env-catch-${envIdCounter}`,
          type: 'block',
          bindings: {},
          outer: outerEnv,
        }
        context.lexicalEnvironment = catchEnv

        // Bind error to catch variable
        if (node.handler.param) {
          catchEnv.bindings[node.handler.param.name] = {
            type: 'string',
            value: error instanceof Error ? error.message : String(error),
            initialized: true,
          }
        }

        const result = executeNode(node.handler.body, state, steps, sourceCode)
        context.lexicalEnvironment = outerEnv
        return result
      }
    }
    throw error // Rethrow if no catch
  } finally {
    if (node.finalizer) {
      executeNode(node.finalizer, state, steps, sourceCode)
    }
  }
}

function executeWhileStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  let iterations = 0
  const maxIterations = DEFAULT_MAX_LOOP_ITERATIONS

  while (iterations < maxIterations) {
    const test = executeNode(node.test, state, steps, sourceCode)
    if (!test.value) break

    const result = executeNode(node.body, state, steps, sourceCode)
    if (result.isBreak) break
    if (result.isContinue) {
      iterations++
      continue
    }
    if (result.isReturn || result.isAwait) return result

    iterations++
  }

  if (iterations >= maxIterations) {
    throw new Error(`Infinite loop detected: exceeded ${maxIterations} iterations`)
  }

  return { type: 'undefined', value: undefined }
}

function executeAwaitExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const value = executeNode(node.argument, state, steps, sourceCode)

  // This is a simplified simulation of await.
  steps.push(
    createStep(
      state,
      node,
      'async',
      'enqueue-microtask',
      `awaiting promise... function will continue as microtask`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { ...value, isAwait: true }
}

function executeNewExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  const calleeName = node.callee.name || 'Object'

  if (calleeName === 'Promise') {
    return executePromiseConstructor(node, state, steps, sourceCode)
  }

  // Generic object creation
  heapIdCounter++
  const heapId = `heap-${heapIdCounter}`

  const heapObj: HeapObject = {
    id: heapId,
    type: 'object',
    properties: {},
    referenceCount: 1,
    createdAtStep: stepCounter + 1,
    capturedEnvironment: null,
  }
  state.memoryHeap.push(heapObj)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'create-object',
      `new ${calleeName}()`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'object', value: calleeName, heapId }
}

function processEventLoop(state: InterpreterState, steps: ExecutionStep[]): void {
  let iterations = 0
  const maxIterations = 50

  while (iterations < maxIterations) {
    // Check if there are any pending tasks
    const hasWebApis = state.webApis.some((w) => w.status === 'pending')
    const hasMicrotasks = state.microTaskQueue.length > 0
    const hasMacrotasks = state.taskQueue.length > 0

    if (!hasWebApis && !hasMicrotasks && !hasMacrotasks) break

    // Move completed Web API tasks to task queue
    for (const webApi of state.webApis) {
      if (webApi.status === 'pending') {
        webApi.remainingTime = 0
        webApi.status = 'ready'

        const macroTask: MacroTask = {
          id: generateId('task'),
          type: 'setTimeout',
          callbackName: webApi.callbackName,
          webApiTaskId: webApi.id,
          createdAtStep: stepCounter + 1,
          callbackAst: webApi.callbackAst,
          callbackValue: webApi.callbackValue, // PASS THE VALUE!
        }
        state.taskQueue.push(macroTask)

        state.eventLoopPhase = 'checking-macrotasks'
        steps.push(
          createStep(
            state,
            null,
            'async',
            'enqueue-macrotask',
            `setTimeout callback "${webApi.callbackName}" moved to Task Queue`,
            1,
            0
          )
        )
      }
    }

    // Process all microtasks first (CRITICAL: before macrotasks!)
    state.eventLoopPhase = 'checking-microtasks'
    while (state.microTaskQueue.length > 0) {
      const microtask = state.microTaskQueue.shift()!
      state.eventLoopPhase = 'executing-microtask'

      steps.push(
        createStep(
          state,
          null,
          'async',
          'dequeue-microtask',
          `Executing microtask: ${microtask.callbackName}`,
          1,
          0
        )
      )

      // Execute callback properly using the new helper
      if (microtask.isContinuation && microtask.remainingStatements && microtask.contextToResume) {
        // Resume async function continuation
        const prevContextId = state.currentContextId
        state.currentContextId = microtask.contextToResume

        steps.push(
          createStep(
            state,
            null,
            'async',
            'call-function',
            `Resuming async function continuation`,
            1,
            0
          )
        )

        for (const stmt of microtask.remainingStatements) {
          const result = executeNode(stmt, state, steps, '')
          if (result.isAwait || result.isReturn) break
        }

        state.currentContextId = prevContextId
      } else if (microtask.callbackValue) {
        let args: RuntimeValue[] = []

        // If it's a promise .then() or similar, pass the result as argument
        if (microtask.type === 'promise-then' && microtask.promiseId) {
          const promise = state.promises.find((p) => p.id === microtask.promiseId)
          if (promise && promise.status === 'fulfilled' && promise.value) {
            args = [promise.value]
          }
        }

        const result = executeFunction(
          microtask.callbackValue,
          microtask.callbackName,
          args,
          state,
          steps,
          microtask.callbackAst,
          ''
        )

        // Resolve the new promise with the callback result
        if (microtask.newPromiseId) {
          const newPromise = state.promises.find((p) => p.id === microtask.newPromiseId)
          if (newPromise) {
            newPromise.status = 'fulfilled'
            newPromise.value = result
            newPromise.resolvedAtStep = stepCounter

            // Also update the heap object for this promise
            const heapObj = state.memoryHeap.find(
              (h) => h.properties['[[PromiseId]]']?.value === microtask.newPromiseId
            )
            if (heapObj) {
              heapObj.properties['[[PromiseState]]'] = { type: 'string', value: 'fulfilled' }
              heapObj.properties['[[PromiseResult]]'] = result
            }

            steps.push(
              createStep(
                state,
                null,
                'async',
                'resolve-promise',
                `Promise resolved with ${formatValue(result)}`,
                1,
                0
              )
            )
          }
        }
      } else if (microtask.callbackAst) {
        const funcValue = executeNode(microtask.callbackAst, state, steps, '')
        let args: RuntimeValue[] = []

        // If it's a promise .then() or similar, pass the result as argument
        if (microtask.type === 'promise-then' && microtask.promiseId) {
          const promise = state.promises.find((p) => p.id === microtask.promiseId)
          if (promise && promise.status === 'fulfilled' && promise.value) {
            args = [promise.value]
          }
        }

        executeFunction(
          funcValue,
          microtask.callbackName,
          args,
          state,
          steps,
          microtask.callbackAst,
          ''
        )
      }
    }

    // Process one macrotask
    if (state.taskQueue.length > 0) {
      state.eventLoopPhase = 'executing-macrotask'
      const macrotask = state.taskQueue.shift()!

      steps.push(
        createStep(
          state,
          null,
          'async',
          'dequeue-macrotask',
          `Executing macrotask: ${macrotask.callbackName}`,
          1,
          0
        )
      )

      // Mark web API as completed
      const webApi = state.webApis.find((w) => w.id === macrotask.webApiTaskId)
      if (webApi) {
        webApi.status = 'completed'
      }

      // Execute the callback properly using the new helper
      if (macrotask.callbackValue) {
        executeFunction(
          macrotask.callbackValue,
          macrotask.callbackName,
          [],
          state,
          steps,
          macrotask.callbackAst,
          ''
        )
      } else if (macrotask.callbackAst) {
        const funcValue = executeNode(macrotask.callbackAst, state, steps, '')
        executeFunction(
          funcValue,
          macrotask.callbackName,
          [],
          state,
          steps,
          macrotask.callbackAst,
          ''
        )
      }
    }

    iterations++
  }
}

function formatValue(value: RuntimeValue): string {
  if (value.type === 'undefined') return 'undefined'
  if (value.type === 'null') return 'null'
  if (value.type === 'string') return `"${value.value}"`
  if (value.type === 'function') return `ƒ ${value.value || 'anonymous'}`
  if (value.type === 'object') return '{...}'
  if (value.type === 'array') return '[...]'
  return String(value.value)
}

export type { InterpreterState }
