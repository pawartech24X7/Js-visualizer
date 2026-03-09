#!/usr/bin/env node

/**
 * JavaScript Interpreter Stress Test Runner
 * 
 * This script validates the correctness of the JavaScript interpreter
 * by running a comprehensive suite of 15 stress tests covering:
 * - Closures and scope
 * - Hoisting and TDZ
 * - Event loop behavior
 * - Promises and async/await
 * - Object reference semantics
 */

import { runAllTests, generateReport } from './test-runner'
import { testSuite } from './test-suite'

// Run all tests
console.log('\n' + '='.repeat(80))
console.log('JAVASCRIPT INTERPRETER STRESS TEST')
console.log('='.repeat(80) + '\n')

const allPassed = runAllTests(testSuite)

// Exit with appropriate code (browser-compatible)
if (!allPassed) {
  console.error('\n❌ Some tests failed!')
} else {
  console.log('\n✅ All tests passed!')
}
