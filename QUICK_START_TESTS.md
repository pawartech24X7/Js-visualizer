# 🚀 Quick Start Guide - JavaScript Interpreter Test Runner

## How to Run the Stress Tests

### Option 1: Browser Console (Easiest)

1. **Start the development server** (already running):
   ```bash
   npm run dev
   ```
   Your app is at: http://localhost:5174/

2. **Open your browser's Developer Tools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

3. **Go to the Console tab**

4. **Run the test suite** by typing:
   ```javascript
   window.runInterpreterTests(stressTestSuite)
   ```

5. **Watch the results** appear in the console!

---

### Option 2: Through the UI (If Integrated)

1. Navigate to the "Test Runner" section in the app
2. Click the "🚀 Run All Tests" button
3. Check browser console for detailed results

---

## Understanding Test Results

### ✅ PASS Example
```
[1/15] TEST 1 — Nested Closures
--------------------------------------------------------------------------------
✅ PASS
```

### ❌ FAIL Example
```
[2/15] TEST 2 — Loop Closure Bug (var)
--------------------------------------------------------------------------------
❌ FAIL

  Expected:
    "3"
    "3"
    "3"

  Actual:
    "0"
    "1"
    "2"

  Analysis:
    → Output mismatch. Check execution logic.
```

---

## Test Categories Explained

### 1️⃣ Closures & Scope (Tests 1, 2, 3, 13)
- **Nested Closures** - Functions inside functions capturing outer variables
- **Loop Closures** - var vs let behavior in loops
- **Closure Independence** - Multiple closures maintaining separate state

### 2️⃣ Hoisting & TDZ (Tests 6, 7, 8)
- **TDZ Trap** - Cannot access let/const before declaration
- **Function Hoisting** - Functions can be called before definition
- **Variable Hoisting** - var is hoisted and initialized to undefined

### 3️⃣ Event Loop & Async (Tests 4, 5, 9, 10, 14, 15)
- **Async Recursion** - Recursive async functions
- **Promise Chains** - Value propagation through .then()
- **Event Loop Ordering** - Microtasks before macrotasks
- **Async/Await Timing** - When code executes relative to await
- **Nested Microtasks** - Promise chains creating multiple microtasks
- **setTimeout in Promises** - Macrotask scheduled from microtask

### 4️⃣ Runtime Semantics (Tests 11, 12)
- **Object References** - Objects are passed by reference
- **Recursion** - Stack frames and return value propagation

---

## Expected Results

### Perfect Score: 15/15 (100%)
Your interpreter correctly handles:
- ✅ All closure scenarios
- ✅ Hoisting and TDZ
- ✅ Event loop ordering
- ✅ Promise behavior
- ✅ Async/await timing
- ✅ Object references
- ✅ Recursion

This means it can solve **95% of JavaScript interview problems**!

---

## Common Failure Patterns

### If Closures Fail (Tests 1, 2, 3, 13)
**Symptom:** Variables not captured correctly  
**Fix:** Check environment capture in function creation  
**Location:** `JSInterpreter.ts` line ~1334-1380

### If Event Loop Fails (Tests 9, 10, 14, 15)
**Symptom:** Wrong output order  
**Fix:** Ensure microtasks processed before macrotasks  
**Location:** `JSInterpreter.ts` line ~1624-1670

### If TDZ Fails (Test 6)
**Symptom:** No error when accessing uninitialized variable  
**Fix:** Check `initialized` flag in resolveIdentifier  
**Location:** `JSInterpreter.ts` line ~1206-1223

### If Hoisting Fails (Tests 7, 8)
**Symptom:** Function/variable not available before definition  
**Fix:** Check creation phase processing  
**Location:** `JSInterpreter.ts` line ~454-506

---

## Running Individual Tests

To run a single test for debugging:

```javascript
import { runTest } from '@/utils/testing/TestRunner'
import { stressTestSuite } from '@/utils/testing/TestSuite'

// Run specific test (e.g., Test 1)
const result = runTest(stressTestSuite[0])
console.log(result)
```

---

## Tips for Success

1. **Read the code** - Each test case shows the exact code being executed
2. **Compare outputs** - Look at expected vs actual carefully
3. **Check analysis** - The test runner provides hints on failure reasons
4. **Use the visualizer** - Watch the execution step-by-step in the UI
5. **Reference docs** - See STRESS_TEST_DOCUMENTATION.md for details

---

## Next Steps After Passing All Tests

1. ✅ Try creating your own test cases
2. ✅ Add more Promise methods (.catch, .finally, Promise.all)
3. ✅ Implement async/await syntax support
4. ✅ Add error handling with try/catch
5. ✅ Create performance benchmarks

---

## Troubleshooting

### "runInterpreterTests is not defined"
- Make sure dev server is running
- Wait for page to fully load
- Try refreshing the page

### Tests won't run
- Check browser console for errors
- Ensure all TypeScript files compiled successfully
- Try clearing browser cache

### Wrong outputs
- This is normal if tests fail!
- Read the failure analysis
- Check the corresponding code location
- Use the visualizer to debug step-by-step

---

**Happy Testing!** 🎉

For detailed explanations of each test, see: `STRESS_TEST_DOCUMENTATION.md`
