import { create } from 'zustand'
import type { ExecutionStep, ExecutionError, ParsedCode } from '@/types'

interface ExecutionState {
  sourceCode: string
  parsedCode: ParsedCode | null
  executionSteps: ExecutionStep[]
  currentStepIndex: number
  isPlaying: boolean
  playbackSpeed: number
  isExecuting: boolean
  error: ExecutionError | null
  setSourceCode: (code: string) => void
  setParsedCode: (parsed: ParsedCode | null) => void
  setExecutionSteps: (steps: ExecutionStep[]) => void
  setCurrentStepIndex: (index: number) => void
  nextStep: () => void
  previousStep: () => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  reset: () => void
  setSpeed: (speed: number) => void
  setIsExecuting: (isExecuting: boolean) => void
  setError: (error: ExecutionError | null) => void
  getCurrentStep: () => ExecutionStep | null
}

const DEFAULT_CODE = `// JavaScript Visualizer - Try these examples!
// Example 1: Basic Variables and Hoisting
var message = "Hello";
let count = 42;
const PI = 3.14159;

console.log(message, count, PI);

// Example 2: Function and Closure
function createCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter());
console.log(counter());

// Example 3: Async - setTimeout
console.log("Start");

setTimeout(function timeout() {
  console.log("Timeout callback");
}, 1000);

console.log("End");

// Example 4: Promises
const promise = new Promise(function executor(resolve) {
  resolve("Promise resolved!");
});

promise.then(function onFulfilled(value) {
  console.log(value);
});

console.log("After promise.then");
`

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  sourceCode: DEFAULT_CODE,
  parsedCode: null,
  executionSteps: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 1,
  isExecuting: false,
  error: null,

  setSourceCode: (code) => set({ sourceCode: code, error: null }),
  
  setParsedCode: (parsed) => set({ parsedCode: parsed }),
  
  setExecutionSteps: (steps) => set({ 
    executionSteps: steps, 
    currentStepIndex: steps.length > 0 ? 0 : -1 
  }),
  
  setCurrentStepIndex: (index) => {
    const { executionSteps } = get()
    if (index >= -1 && index < executionSteps.length) {
      set({ currentStepIndex: index })
    }
  },

  nextStep: () => {
    const { currentStepIndex, executionSteps } = get()
    if (currentStepIndex < executionSteps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 })
    } else {
      set({ isPlaying: false })
    }
  },

  previousStep: () => {
    const { currentStepIndex } = get()
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 })
    }
  },

  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  togglePlay: () => {
    const { isPlaying, executionSteps, currentStepIndex } = get()
    if (!isPlaying && currentStepIndex >= executionSteps.length - 1) {
      set({ currentStepIndex: 0, isPlaying: true })
    } else {
      set({ isPlaying: !isPlaying })
    }
  },

  reset: () => set({ 
    currentStepIndex: 0, 
    isPlaying: false 
  }),

  setSpeed: (speed) => set({ playbackSpeed: Math.max(0.25, Math.min(4, speed)) }),
  
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  
  setError: (error) => set({ error, isPlaying: false }),

  getCurrentStep: () => {
    const { executionSteps, currentStepIndex } = get()
    return currentStepIndex >= 0 && currentStepIndex < executionSteps.length 
      ? executionSteps[currentStepIndex] 
      : null
  },
}))
