import { runAllTests } from '@/utils/testing/TestRunner'
import { stressTestSuite } from '@/utils/testing/TestSuite'
import { Button } from '@/components/ui'

export function TestRunner() {
  const handleRunTests = () => {
   runAllTests(stressTestSuite)
  }
  
 return (
    <div className="p-4">
     <h2 className="text-xl font-bold mb-4">Interpreter Stress Tests</h2>
      <p className="mb-4 text-sm text-gray-600">
        Run 35 comprehensive tests to validate interpreter correctness covering:
        closures, hoisting, TDZ, event loop, promises, and async/await.
      </p>
     <Button onClick={handleRunTests} className="bg-blue-600 hover:bg-blue-700">
       🚀 Run All 35 Tests
     </Button>
      
     <div className="mt-6 p-4 bg-gray-100 rounded-lg">
       <h3 className="font-semibold mb-2">Test Categories:</h3>
       <ul className="text-sm space-y-1 grid grid-cols-2 gap-2">
         <li>✓ Nested Closures</li>
         <li>✓ Loop Closures(var vs let)</li>
         <li>✓ Async Recursion</li>
         <li>✓ Promise Chains</li>
         <li>✓ Temporal Dead Zone (TDZ)</li>
         <li>✓ Function Hoisting</li>
         <li>✓ Variable Hoisting</li>
         <li>✓ Event Loop Ordering</li>
         <li>✓ Async/Await Timing</li>
         <li>✓ Object Reference Semantics</li>
         <li>✓ Array Reference Mutation</li>
         <li>✓ Recursion</li>
         <li>✓ Closure Independence</li>
         <li>✓ Closure State Persistence</li>
         <li>✓ Nested Microtasks</li>
         <li>✓ setTimeout in Promises</li>
         <li>✓ Closure Shadowing</li>
         <li>✓ Deep Closure Chains</li>
         <li>✓ Block Scope Isolation</li>
         <li>✓ var Scope Leakage</li>
         <li>✓ Nested Event Loops</li>
         <li>✓ Function Returning Functions</li>
         <li>✓ Promise Return Values</li>
       </ul>
     </div>
    </div>
  )
}
