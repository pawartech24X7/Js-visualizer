import { interpret } from '@/utils/execution/JSInterpreter'
import type { ExecutionStep } from '@/types'

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
}

/**
 * Extract console output from execution steps
 */
function extractConsoleOutput(steps: ExecutionStep[]): string[] {
  const outputs: string[] = []
  
  if (steps.length === 0) return outputs
  
  // Get all console entries from the final step
  const lastStep = steps[steps.length - 1]
  const entries = lastStep.consoleOutput || []
  
  // Sort by step number for correct ordering
  const sorted = [...entries].sort((a, b) => a.stepNumber - b.stepNumber)
  
  for (const entry of sorted) {
  const text = entry.args.map(arg => {
     switch (arg.type) {
       case 'string': return String(arg.value)
       case 'undefined': return 'undefined'
       case 'null': return 'null'
       case 'number': return String(arg.value)
       case 'boolean': return String(arg.value)
       case 'function': return `ƒ ${arg.value || 'anonymous'}`
       case 'object': return '{...}'
       case 'array': return '[...]'
       default: return String(arg.value)
     }
    }).join(' ')
    
  outputs.push(text)
  }
  
 return outputs
}

/**
 * Run a single test
 */
export function runTest(test: TestCase): TestResult {
  try {
  const steps = interpret(test.code)
  const actual = extractConsoleOutput(steps)
   
   // Compare outputs
  const passed = test.expectedOutput.length === actual.length &&
                 test.expectedOutput.every((exp, i) => exp.trim() === actual[i].trim())
   
 return {
     testName: test.name,
     passed,
     expectedOutput: test.expectedOutput,
     actualOutput: actual,
   }
  } catch (err) {
 return {
     testName: test.name,
     passed: false,
     expectedOutput: test.expectedOutput,
     actualOutput: [],
     error: err instanceof Error ? err.message: 'Unknown error',
    }
  }
}

/**
 * Run all tests and display results
 */
export function runAllTests(tests: TestCase[]): void {
  console.clear()
  
  console.log('\n' + '='.repeat(80))
  console.log('           JAVASCRIPT INTERPRETER STRESS TEST SUITE')
  console.log('='.repeat(80) + '\n')
  
  let passCount = 0
  let failCount = 0
  
  tests.forEach((test, index) => {
  console.log(`\n[${index +1}/${tests.length}] ${test.name}`)
  console.log('-'.repeat(80))
    
  const result = runTest(test)
    
  if (result.passed) {
    console.log('✅ PASS')
     passCount++
    } else {
    console.log('❌ FAIL')
     failCount++
      
   console.log('\n  Expected:')
   result.expectedOutput.forEach(line => console.log(`    "${line}"`))
      
   console.log('\n  Actual:')
   result.actualOutput.length > 0 
       ? result.actualOutput.forEach(line => console.log(`    "${line}"`))
       : console.log('    (no output)')
      
   if (result.error) {
     console.log(`\n  Error: ${result.error}`)
      }
    }
  })
  
  // Summary
  const total = tests.length
  const passRate = ((passCount / total) * 100).toFixed(1)
  
  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Tests: ${total}`)
  console.log(`Passed: ${passCount}`)
  console.log(`Failed: ${failCount}`)
  console.log(`Pass Rate: ${passRate}%`)
  console.log('='.repeat(80) + '\n')
  
  if (failCount === 0) {
  console.log('🎉 ALL TESTS PASSED!\n')
  } else {
  console.log(`⚠️  ${failCount} TEST(S) FAILED\n`)
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  (window as any).runInterpreterTests = runAllTests
}
