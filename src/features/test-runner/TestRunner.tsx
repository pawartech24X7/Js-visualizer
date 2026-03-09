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
        Run 15 comprehensive tests to validate interpreter correctness covering:
        closures, hoisting, TDZ, event loop, promises, and async/await.
      </p>
     <Button onClick={handleRunTests} className="bg-blue-600 hover:bg-blue-700">
       🚀 Run All Tests
     </Button>
      
     <div className="mt-6 p-4 bg-gray-100 rounded-lg">
       <h3 className="font-semibold mb-2">Test Categories:</h3>
       <ul className="text-sm space-y-1">
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
         <li>✓ Recursion</li>
         <li>✓ Closure Independence</li>
         <li>✓ Nested Microtasks</li>
         <li>✓ setTimeout in Promises</li>
       </ul>
     </div>
    </div>
  )
}
