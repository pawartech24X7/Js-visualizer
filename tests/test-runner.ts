import { interpret } from '../src/utils/execution/JSInterpreter'
import type { ExecutionStep } from '../src/types'

export interface TestCase {
  name: string
  code: string
  expectedOutput: string[]
}

export interface TestResult {
  testName: string
  passed: boolean
  expectedOutput: string[]
  actualOutput: string[]
  error?: string
  debugInfo?: {
    totalSteps: number
   consoleEntries: number
    hasExecutionContexts: boolean
    hasCallStack: boolean
    hasMicrotasks: boolean
    hasMacrotasks: boolean
    hasPromises: boolean
  }
}

/**
 * Extract console output from execution steps
 */
function extractConsoleOutput(steps: ExecutionStep[]): string[] {
  const consoleOutputs: string[] = []
  
  // Get the last step which contains all accumulated console output
  if (steps.length > 0) {
   const lastStep = steps[steps.length - 1]
   const consoleEntries = lastStep.consoleOutput || []
    
    // Sort by step number to ensure correct order
   const sortedEntries = [...consoleEntries].sort((a, b) => a.stepNumber - b.stepNumber)
    
    for (const entry of sortedEntries) {
     const argsStr = entry.args.map(arg => {
       if (arg.type === 'string') return arg.value
       if (arg.type === 'undefined') return 'undefined'
       if (arg.type === 'null') return 'null'
       if (arg.type === 'number') return String(arg.value)
       if (arg.type === 'boolean') return String(arg.value)
       if (arg.type === 'function') return `ƒ ${arg.value || 'anonymous'}`
       if (arg.type === 'object') return '{...}'
       if (arg.type === 'array') return '[...]'
        return String(arg.value)
      }).join(' ')
      
     consoleOutputs.push(argsStr)
    }
  }
  
 return consoleOutputs
}

/**
 * Compare outputs (handles multi-line and whitespace)
 */
function compareOutputs(expected: string[], actual: string[]): boolean {
  if (expected.length !== actual.length) return false
  
  for (let i = 0; i < expected.length; i++) {
   if (expected[i].trim() !== actual[i].trim()) return false
  }
  
 return true
}

/**
 * Run a single test case
 */
export function runTest(testCase: TestCase): TestResult {
  try {
   const steps = interpret(testCase.code)
   const actualOutput = extractConsoleOutput(steps)
   const passed = compareOutputs(testCase.expectedOutput, actualOutput)
    
    // Debug info for failed tests
   const debugInfo = {
      totalSteps: steps.length,
     consoleEntries: steps[steps.length - 1]?.consoleOutput?.length || 0,
      hasExecutionContexts: (steps[steps.length - 1]?.executionContexts?.length || 0) > 0,
      hasCallStack: (steps[steps.length - 1]?.callStack?.length || 0) > 0,
      hasMicrotasks: (steps[steps.length -1]?.microTaskQueue?.length || 0) > 0,
      hasMacrotasks: (steps[steps.length - 1]?.taskQueue?.length || 0) > 0,
      hasPromises: (steps[steps.length - 1]?.promises?.length || 0) > 0,
    }
    
    return {
      testName: testCase.name,
      passed,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      debugInfo,
    }
  } catch (error) {
    return {
      testName: testCase.name,
      passed: false,
      expectedOutput: testCase.expectedOutput,
      actualOutput: [],
      error: error instanceof Error ? error.message: 'Unknown error',
    }
  }
}

/**
 * Run all tests and generate report
 */
export function runTestSuite(testCases: TestCase[]): TestResult[] {
 return testCases.map(testCase => runTest(testCase))
}

/**
 * Generate human-readable report
 */
export function generateReport(results: TestResult[]): string {
  const total = results.length
  const passed = results.filter(r => r.passed).length
  const failed = total - passed
  const passRate = ((passed / total) * 100).toFixed(1)
  
  let report = '\n'
 report += '═'.repeat(80) + '\n'
 report += '                    JAVASCRIPT INTERPRETER TEST REPORT\n'
 report += '═'.repeat(80) + '\n\n'
  
 report += `Total Tests: ${total}\n`
 report += `Passed: ${passed}\n`
 report += `Failed: ${failed}\n`
 report += `Pass Rate: ${passRate}%\n\n`
  
 report += '─'.repeat(80) + '\n'
 report += 'DETAILED RESULTS\n'
 report += '─'.repeat(80) + '\n\n'
  
  for (const result of results) {
   const status = result.passed ? '✅ PASS' : '❌ FAIL'
    report += `${status} — ${result.testName}\n`
    
   if (!result.passed) {
      report += `\n  Expected Output:\n`
      result.expectedOutput.forEach((line, i) => {
        report += `    ${i + 1}. "${line}"\n`
      })
      
      report += `\n  Actual Output:\n`
      result.actualOutput.forEach((line, i) => {
        report += `    ${i + 1}. "${line}"\n`
      })
      
     if (result.error) {
        report += `\n  Error: ${result.error}\n`
      }
      
     if (result.debugInfo) {
        report += `\n  Debug Info:\n`
        report += `    - Total Steps: ${result.debugInfo.totalSteps}\n`
        report += `    - Console Entries: ${result.debugInfo.consoleEntries}\n`
        report += `    - Has Execution Contexts: ${result.debugInfo.hasExecutionContexts}\n`
        report += `    - Has Call Stack: ${result.debugInfo.hasCallStack}\n`
        report += `    - Has Microtasks: ${result.debugInfo.hasMicrotasks}\n`
        report += `    - Has Macrotasks: ${result.debugInfo.hasMacrotasks}\n`
        report += `    - Has Promises: ${result.debugInfo.hasPromises}\n`
      }
      
      // Provide analysis
      report += `\n  Analysis:\n`
     if (result.actualOutput.length === 0 && !result.error) {
        report += `    → No console output captured. Check if console.log is implemented correctly.\n`
      } else if (result.actualOutput.length !== result.expectedOutput.length) {
        report += `    → Output count mismatch. Expected ${result.expectedOutput.length} lines, got ${result.actualOutput.length}.\n`
        
       if (result.debugInfo?.hasMicrotasks || result.debugInfo?.hasMacrotasks) {
          report += `    → Possible event loop ordering issue. Check microtask/macrotask queue processing.\n`
        }
      } else {
        report += `    → Output mismatch. Check execution logic.\n`
      }
      
      report += '\n'
    }
    
    report += '\n'
  }
  
 report += '─'.repeat(80) + '\n'
  
  if (failed === 0) {
    report += '🎉 ALL TESTS PASSED! Interpreter is working correctly.\n'
  } else {
    report += `⚠️  ${failed} TEST(S) FAILED. Review the issues above.\n`
  }
  
 report += '═'.repeat(80) + '\n'
  
 return report
}

/**
 * Main test runner
 */
export function runAllTests(testCases: TestCase[]): boolean {
  console.log('\n🚀 Starting JavaScript Interpreter Test Suite...\n')
  
  const results = runTestSuite(testCases)
  const report = generateReport(results)
  
  console.log(report)
  
  const failed = results.filter(r => !r.passed).length
 return failed === 0
}
