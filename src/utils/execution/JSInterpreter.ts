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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function resetCounters(): void {
  stepCounter = 0
  heapIdCounter = 0
  contextIdCounter = 0
  taskIdCounter = 0
  envIdCounter = 0
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
  return {
    callStack: state.callStack.map((f) => ({ ...f, arguments: [...f.arguments] })),
    executionContexts: state.executionContexts.map((ctx) => ({
      ...ctx,
      variableEnvironment: { ...ctx.variableEnvironment },
      lexicalEnvironment: { ...ctx.lexicalEnvironment },
      hoistedDeclarations: [...ctx.hoistedDeclarations],
      tdzVariables: new Set(ctx.tdzVariables),
    })),
    memoryStack: state.memoryStack.map((s) => ({ ...s, value: { ...s.value } })),
    memoryHeap: state.memoryHeap.map((h) => ({
      ...h,
      properties: { ...h.properties },
      arrayElements: h.arrayElements ? [...h.arrayElements] : undefined,
      functionParams: h.functionParams ? [...h.functionParams] : undefined,
     capturedEnvironment: h.capturedEnvironment ? { ...h.capturedEnvironment } : null,
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
  stepCounter++
  const clonedState = cloneState(state)

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
    activeContextId: clonedState.currentContextId,
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
  contextIdCounter++
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

function createFunctionContext(name: string, outerEnv: EnvironmentRecord | null): ExecutionContext {
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
  
 return {
    id: `ctx-${contextIdCounter}`,
    type: 'function',
    name,
   parentId: null,
   variableEnvironment: funcVarEnv,
   lexicalEnvironment: funcLexEnv,
  thisBinding: { type: 'undefined', value: undefined },
  hoistedDeclarations: [],
  tdzVariables: new Set(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any

export function interpret(sourceCode: string): ExecutionStep[] {
  resetCounters()
  const steps: ExecutionStep[] = []

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

  for (const node of nodes) {
    if (node.type === 'FunctionDeclaration') {
   const funcNode = node as AnyNode
   const name = funcNode.id?.name || 'anonymous'

      // Create heap object for function with captured environment
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
        capturedEnvironment: context.lexicalEnvironment, // Capture current lexical environment
        referenceCount: 1,
    createdAtStep: stepCounter,
      }
   state.memoryHeap.push(funcHeapObj)

      // Add to variable environment (hoisted)
     varEnv.bindings[name] = {
        type: 'function',
        value: name,
        heapId,
        initialized: true,
      }
    context.hoistedDeclarations.push(name)

      // Add to memory stack
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
    } else if (node.type === 'VariableDeclaration') {
   const varNode = node as AnyNode
      if (varNode.kind === 'var') {
        for (const decl of varNode.declarations) {
       const name = decl.id?.name || 'unknown'

          // Hoist var to variable environment
          varEnv.bindings[name] = {
            type: 'undefined',
            value: undefined,
           initialized: true, // var is initialized during creation
          }
        context.hoistedDeclarations.push(name)

        state.memoryStack.push({
            id: generateId('mem'),
            variableName: name,
            scopeId: context.id,
            type: 'primitive',
            value: { type: 'undefined', value: undefined },
          })

        steps.push(
          createStep(
            state,
              node,
              'creation',
              'hoisting',
              `Hoisting var declaration: ${name} = undefined`,
              getNodeLine(node),
              getNodeColumn(node)
            )
          )
        }
      }
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
      return executeAssignment(node, state, steps, context)

    case 'BinaryExpression':
      return evaluateBinaryExpression(node, state, steps, sourceCode)

    case 'Literal':
      return createRuntimeValue(node.value)

    case 'Identifier':
      return resolveIdentifier(node.name, state)

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

    case 'IfStatement': {
      const result = executeIfStatement(node, state, steps, sourceCode)
      return result
    }

    case 'ForStatement':
      return executeForStatement(node, state, steps, sourceCode)

    case 'WhileStatement':
      return executeWhileStatement(node, state, steps, sourceCode)

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
        for (const stmt of node.body) {
          lastVal = executeNode(stmt, state, steps, sourceCode)
          if (lastVal.isReturn) {
            // Restore environment before returning
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
        if (lastVal.isReturn) return lastVal
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
      return evaluateUpdateExpression(node, state, context)

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
   const isInitialized = !!decl.init
      
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

function executeCallExpression(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  // Handle console.log, setTimeout, Promise, etc.
  if (node.callee.type === 'MemberExpression') {
    const obj = node.callee.object
    const prop = node.callee.property

    if (obj.type === 'Identifier' && obj.name === 'console') {
      return executeConsoleMethod(node, prop.name, state, steps, sourceCode)
    }

    if (obj.type === 'Identifier' && obj.name === 'Promise') {
      return executePromiseMethod(node, prop.name, state, steps, sourceCode)
    }
  }

  // Handle setTimeout, setInterval
  if (node.callee.type === 'Identifier') {
    const name = node.callee.name

    if (name === 'setTimeout') {
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

  if (funcValue.type === 'function' && funcValue.heapId) {
    const heapObj = state.memoryHeap.find((h) => h.id === funcValue.heapId)
    if (heapObj && heapObj.functionAst) {
      // CRITICAL FIX: Use captured environment for function's outer lexical environment
    const capturedEnv = heapObj.capturedEnvironment
      
      // Create new execution context with captured environment as outer
    const newContext = createFunctionContext(funcName, capturedEnv)
    state.executionContexts.push(newContext)

      // Map parameters to arguments
      if (heapObj.functionParams) {
       heapObj.functionParams.forEach((paramName, index) => {
        const val = args[index] || { type: 'undefined', value: undefined }
         newContext.lexicalEnvironment.bindings[paramName] = val
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
        line: getNodeLine(node),
        column: getNodeColumn(node),
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
          'execution',
          'call-function',
          `Calling function: ${funcName}(${args.map((a) => formatValue(a)).join(', ')})`,
          getNodeLine(node),
          getNodeColumn(node)
        )
      )

      // Execute function body
      let result: RuntimeValue
      if (heapObj.functionAst.type === 'BlockStatement') {
        result = executeNode(heapObj.functionAst, state, steps, sourceCode)
      } else {
        // Arrow function with expression body - wrap result as if it was returned
        result = executeNode(heapObj.functionAst, state, steps, sourceCode)
        result = { ...result, isReturn: true }
      }

      // If it was a return, unwrap it
      if (result.isReturn) {
        result = { ...result, isReturn: false }
      }

      // Pop from call stack and restore context
      state.callStack.pop()
      state.currentContextId = prevContextId

      steps.push(
        createStep(
          state,
          node,
          'execution',
          'return-function',
          `Function ${funcName} returned ${formatValue(result)}`,
          getNodeLine(node),
          getNodeColumn(node)
        )
      )

      return result
    }
  }

  // Fallback for native/unknown functions
  steps.push(
    createStep(
      state,
      node,
      'execution',
      'call-function',
      `Calling function: ${funcName}(${args.map((a) => formatValue(a)).join(', ')})`,
      getNodeLine(node),
      getNodeColumn(node)
    )
  )

  return { type: 'undefined', value: undefined }
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
  const callback = node.arguments[0]
  const delay = node.arguments[1]
    ? executeNode(node.arguments[1], state, steps, sourceCode)
    : { type: 'number', value: 0 }

  let callbackName = 'anonymous'
  if (callback?.type === 'Identifier') {
    callbackName = callback.name
  } else if (callback?.type === 'FunctionExpression' && callback.id) {
    callbackName = callback.id.name
  } else if (
    callback?.type === 'FunctionExpression' ||
    callback?.type === 'ArrowFunctionExpression'
  ) {
    callbackName = 'callback'
  }

  taskIdCounter++
  const task: WebApiTask = {
    id: `webapi-${taskIdCounter}`,
    apiName: 'setTimeout',
    callbackId: generateId('callback'),
    callbackName,
    delay: typeof delay.value === 'number' ? delay.value : 0,
    startTime: state.virtualTime,
    remainingTime: typeof delay.value === 'number' ? delay.value : 0,
    status: 'pending',
    createdAtStep: stepCounter + 1,
  }
  state.webApis.push(task)

  steps.push(
    createStep(
      state,
      node,
      'execution',
      'schedule-timeout',
      `setTimeout(${callbackName}, ${delay.value}ms) → Web API`,
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
  createdAtStep: stepCounter +1,
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
  sourceCode: string
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
   createdAtStep: stepCounter +1,
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
      },
      referenceCount: 1,
      createdAtStep: stepCounter,
   capturedEnvironment: null,
   }
 state.memoryHeap.push(promiseHeap)

    return { type: 'object', value: 'Promise' }
  }
  
  if (method === 'then') {
    // CRITICAL FIX: Queue .then() callback as microtask
  const callback = node.arguments[0]
    
  if (callback) {
   const callbackName = callback.type === 'Identifier' ? callback.name : 'anonymous callback'
      
     // Get the resolved value from the promise this was called on
   const lastPromise = state.promises[state.promises.length - 1]
  //  const promiseValue = lastPromise?.status === 'fulfilled' ? lastPromise.value : { type: 'undefined', value: undefined }
      
     // Queue microtask with the callback
    taskIdCounter++
  const microtask: MicroTask = {
      id: `microtask-${taskIdCounter}`,
      type: 'promise-then',
      callbackName,
     promiseId: lastPromise?.id,
   createdAtStep: stepCounter +1,
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
    
    // Return a new promise for chaining (simplified)
  heapIdCounter++
 const heapId = `heap-${heapIdCounter}`
 const newPromiseHeap: HeapObject = {
     id: heapId,
     type: 'object',
    properties: {
      '[[PromiseState]]': { type: 'string', value: 'pending' },
      '[[PromiseResult]]': { type: 'undefined', value: undefined },
    },
   referenceCount: 1,
  createdAtStep: stepCounter +1,
   capturedEnvironment: null,
   }
 state.memoryHeap.push(newPromiseHeap)
    
   return { type: 'object', value: 'Promise', heapId }
  }

 return { type: 'undefined', value: undefined }
}

function executeAssignment(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  _context: ExecutionContext
): RuntimeValue {
  const name = node.left?.name || 'unknown'
  const value = executeNode(node.right, state, steps, '')

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

  // Update memory slot - simplified, just update in current context
 const slot = state.memoryStack.find(
    (s) => s.variableName === name && s.scopeId === state.currentContextId
  )
  if (slot) {
    slot.value = value
    slot.type = value.heapId ? 'reference' : 'primitive'
    slot.heapReferenceId = value.heapId
  }

  steps.push(
  createStep(
    state,
      node,
      'execution',
      'assign-variable',
      `${name} = ${formatValue(value)}`,
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

  const leftVal = left.value as number
  const rightVal = right.value as number

  let result: unknown
  switch (node.operator) {
    case '+':
      result =
        typeof leftVal === 'string' || typeof rightVal === 'string'
          ? String(leftVal) + String(rightVal)
          : leftVal + rightVal
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

  return createRuntimeValue(result)
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

function evaluateUpdateExpression(
  node: AnyNode,
  state: InterpreterState,
  _context: ExecutionContext
): RuntimeValue {
  const name = node.argument?.name
  if (!name) return { type: 'undefined', value: undefined }

  const current = resolveIdentifier(name, state)
  const currentVal = current.value as number

  let newVal: number
  if (node.operator === '++') {
    newVal = currentVal + 1
  } else {
    newVal = currentVal - 1
  }

  // Update value - search up closure chain through lexical environments
  const context = getCurrentContext(state)
  if (context) {
    let currentEnv: EnvironmentRecord | null = context.lexicalEnvironment
    
    while (currentEnv) {
      if (name in currentEnv.bindings) {
        currentEnv.bindings[name] = { type: 'number', value: newVal, initialized: true }
        break
      }
      currentEnv = currentEnv.outer
    }
  }

  // Update memory stack slot - simplified
 const slot = state.memoryStack.find(
    (s) => s.variableName === name && s.scopeId === state.currentContextId
  )
  if (slot) {
    slot.value = { type: 'number', value: newVal }
  }

 return node.prefix ? { type: 'number', value: newVal } : { type: 'number', value: currentVal }
}

function resolveIdentifier(name: string, state: InterpreterState): RuntimeValue {
  // Get current context
  const context = getCurrentContext(state)
  if (!context) return { type: 'undefined', value: undefined }

  // Search from current lexical environment up through outer chain
  let currentEnv = context.lexicalEnvironment
  
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
   currentEnv = currentEnv.outer!  // Non-null assertion - loop condition checks for null
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
  createdAtStep: stepCounter +1,
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
  createdAtStep: stepCounter +1,
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
  
  // CRITICAL FIX: Capture the LEXICAL ENVIRONMENT where function is defined
  // This is what makes closures work!
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
  // Initialize
  if (node.init) {
    executeNode(node.init, state, steps, sourceCode)
  }

  let iterations = 0
  const maxIterations = 100 // Safety limit

  while (iterations < maxIterations) {
    // Test condition
    if (node.test) {
      const test = executeNode(node.test, state, steps, sourceCode)
      if (!test.value) break
    }

    // Execute body
    executeNode(node.body, state, steps, sourceCode)

    // Update
    if (node.update) {
      executeNode(node.update, state, steps, sourceCode)
    }

    iterations++
  }

  return { type: 'undefined', value: undefined }
}

function executeWhileStatement(
  node: AnyNode,
  state: InterpreterState,
  steps: ExecutionStep[],
  sourceCode: string
): RuntimeValue {
  let iterations = 0
  const maxIterations = 100

  while (iterations < maxIterations) {
    const test = executeNode(node.test, state, steps, sourceCode)
    if (!test.value) break

    executeNode(node.body, state, steps, sourceCode)
    iterations++
  }

  return { type: 'undefined', value: undefined }
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
  createdAtStep: stepCounter +1,
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
    
    // Execute promise.then() callback if we have the promise value
  if (microtask.type === 'promise-then' && microtask.promiseId) {
  const promise = state.promises.find(p => p.id === microtask.promiseId)
  if (promise && promise.status === 'fulfilled' && promise.value) {
      // Simulate callback execution with promise result
  steps.push(
    createStep(
      state,
         null,
         'async',
         'call-function',
        `${microtask.callbackName}(${formatValue(promise.value)})`,
        1,
         0
       )
     )
      
      // Log the result if it's a callback that would log (simplified simulation)
  if (microtask.callbackName.includes('onFulfilled') || microtask.callbackName.includes('log')) {
     const entry: ConsoleEntry = {
         id: generateId('console'),
        type: 'log',
        args: [promise.value],
        timestamp: Date.now(),
     stepNumber: stepCounter +1,
       }
    state.consoleOutput.push(entry)
      }
    }
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
