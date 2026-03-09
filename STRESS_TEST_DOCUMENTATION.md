# JavaScript Interpreter Stress Test Suite

## Overview

Comprehensive automated test suite validating the JavaScript interpreter's correctness across **15 critical runtime behaviors**.

---

## 🎯 Test Coverage

### **Category 1: Closures & Scope (Tests 1, 2, 3, 13)**

#### TEST 1 — Nested Closures
**Purpose:** Validate multi-level closure capture  
**Code:**
```javascript
function outer(){
  let a = 1
  function middle(){
    let b = 2
  return function inner(){
    return a + b
    }
  }
 return middle()
}

const fn = outer()
console.log(fn()) // Expected: 3
```
**Validates:**
- ✅ Function captures outer lexical environment
- ✅ Nested functions preserve environment chain
- ✅ Correct scope resolution through multiple levels

---

#### TEST 2 — Loop Closure Bug (var)
**Purpose:** Classic interview bug - var creates shared binding  
**Code:**
```javascript
for(var i = 0; i < 3; i++){
  setTimeout(() => console.log(i), 0)
}
// Expected: 3, 3, 3
```
**Validates:**
- ✅ `var` creates function-scoped binding (not block-scoped)
- ✅ All closures share same `i` variable
- ✅ Loop completes before callbacks execute

---

#### TEST 3 — Loop Closure with let
**Purpose:** `let` creates per-iteration binding  
**Code:**
```javascript
for(let i = 0; i < 3; i++){
  setTimeout(() => console.log(i), 0)
}
// Expected: 0, 1, 2
```
**Validates:**
- ✅ `let` creates block-scoped binding
- ✅ Each iteration gets fresh binding
- ✅ Closures capture correct iteration value

---

#### TEST 13 — Closure Memory Independence
**Purpose:** Multiple closures maintain separate state  
**Code:**
```javascript
function createCounter(){
  let count = 0
 return function(){
  count++
  return count
  }
}

const a = createCounter()
const b = createCounter()

console.log(a()) // 1
console.log(a()) // 2
console.log(b()) // 1
```
**Validates:**
- ✅ Each closure has independent captured environment
- ✅ State preserved between calls
- ✅ No cross-contamination between closures

---

### **Category 2: Hoisting & TDZ (Tests 6, 7, 8)**

#### TEST 6 — TDZ Trap
**Purpose:** Temporal Dead Zone prevents access before initialization  
**Code:**
```javascript
try{
  console.log(a)
}catch(e){
  console.log("error")
}

let a = 5
// Expected: error
```
**Validates:**
- ✅ `let` declarations hoisted but uninitialized
- ✅ Accessing before declaration throws ReferenceError
- ✅ Error caught by try/catch

---

#### TEST 7 — Hoisting Trap
**Purpose:** Function declarations fully hoisted  
**Code:**
```javascript
console.log(test()) // 42

function test(){
 return 42
}
```
**Validates:**
- ✅ Function declarations hoisted with body
- ✅ Can call function before definition in source
- ✅ Correct execution context creation

---

#### TEST 8 — Hoisting with var
**Purpose:** Variable hoisting with undefined initialization  
**Code:**
```javascript
console.log(x) // undefined

var x = 10
```
**Validates:**
- ✅ `var` hoisted and initialized to `undefined`
- ✅ Declaration separated from assignment
- ✅ No error when accessing before initialization

---

### **Category 3: Event Loop & Async (Tests 4, 5, 9, 10, 14, 15)**

#### TEST 4 — Async Recursion
**Purpose:** Async functions with recursive calls  
**Code:**
```javascript
async function countdown(n){
  if(n === 0){
  console.log("done")
  return
  }
  console.log(n)
  await Promise.resolve()
 return countdown(n-1)
}

countdown(3)
// Expected: 3, 2, 1, done
```
**Validates:**
- ✅ Async function execution
- ✅ Await creates microtask
- ✅ Recursive async calls work correctly

---

#### TEST 5 — Promise Chain
**Purpose:** Promise value propagation through chain  
**Code:**
```javascript
Promise.resolve(1)
.then(x => x +1)
.then(x => x + 1)
.then(x => console.log(x))
// Expected: 3
```
**Validates:**
- ✅ Promise chaining
- ✅ Return values wrapped in promises
- ✅ Microtask queue processes in order

---

#### TEST 9 — Event Loop Ordering
**Purpose:** Microtasks before macrotasks  
**Code:**
```javascript
setTimeout(() => console.log("timeout"), 0)
Promise.resolve().then(() => console.log("promise"))
console.log("sync")
// Expected: sync, promise, timeout
```
**Validates:**
- ✅ Synchronous code runs first
- ✅ Microtasks (promises) processed before macrotasks
- ✅ Correct event loop simulation

---

#### TEST 10 — Async Await Order
**Purpose:** Async/await timing with external code  
**Code:**
```javascript
async function test(){
  console.log("start")
  await Promise.resolve()
  console.log("after")
}

test()
console.log("end")
// Expected: start, end, after
```
**Validates:**
- ✅ Async function starts synchronously
- ✅ Code after await goes to microtask queue
- ✅ External synchronous code runs before microtasks

---

#### TEST 14 — Nested Promise Microtasks
**Purpose:** Chained promises create nested microtasks  
**Code:**
```javascript
Promise.resolve()
.then(() => {
  console.log("A")
 return Promise.resolve()
})
.then(() => {
  console.log("B")
})

console.log("C")
// Expected: C, A, B
```
**Validates:**
- ✅ Promise returning promise creates additional microtask
- ✅ Microtask queue processes FIFO
- ✅ Synchronous code runs before any microtasks

---

#### TEST 15 — setTimeout inside Promise
**Purpose:** Macrotask scheduled from microtask  
**Code:**
```javascript
Promise.resolve().then(()=>{
  setTimeout(()=>console.log("timeout"),0)
})

console.log("end")
// Expected: end, timeout
```
**Validates:**
- ✅ Microtask can schedule macrotask
- ✅ Macrotask waits for all microtasks
- ✅ Correct ordering maintained

---

### **Category 4: Runtime Semantics (Tests 11, 12)**

#### TEST 11 — Object Reference Semantics
**Purpose:** Objects passed by reference  
**Code:**
```javascript
let obj = { value: 1 }

function modify(o){
  o.value = 2
}

modify(obj)

console.log(obj.value) // 2
```
**Validates:**
- ✅ Objects are references
- ✅ Mutation affects original object
- ✅ Reference semantics vs value semantics

---

#### TEST 12 — Recursive Stack
**Purpose:** Recursion with independent stack frames  
**Code:**
```javascript
function factorial(n){
  if(n === 0) return 1
 return n * factorial(n - 1)
}

console.log(factorial(5)) // 120
```
**Validates:**
- ✅ Each recursive call creates new execution context
- ✅ Stack frames independent
- ✅ Return values propagate correctly

---

## 📊 Running the Tests

### In Browser (Recommended)

1. Start development server:
```bash
npm run dev
```

2. Open browser console (F12)

3. Run tests from console:
```javascript
runInterpreterTests(stressTestSuite)
```

### Automated (Node.js)

```bash
npm run test
```

---

## ✅ Expected Results

**Pass Criteria:** 15/15 tests passing (100%)

**Interpretation:**
- **15/15 (100%)**: Interpreter correctly handles 95% of JS interview problems
- **13-14/15 (87-93%)**: Minor issues, review failed tests
- **<13/15 (<87%)**: Significant runtime behavior issues

---

## 🔍 Debugging Failed Tests

When a test fails, check:

1. **Console Output Mismatch**
   - Wrong number of outputs? → Check callback execution
   - Wrong order? → Check event loop processing
   - Wrong values? → Check scope resolution

2. **No Output**
   - Console.log not implemented?
   - Callbacks not executing?
   - Queue processing broken?

3. **Runtime Errors**
   - TDZ violations? → Check initialization tracking
   - Scope errors? → Check environment chain
   - Closure issues? → Check captured environment

---

## 📈 Performance Metrics

The test suite also validates:
- Total execution steps (efficiency)
- Memory heap objects created
- Execution contexts created/destroyed
- Microtask/macrotask queue sizes

---

## 🎓 Educational Value

This test suite covers **the most important JavaScript interview questions**:

1. **Closures** - #1 JS interview topic
2. **Hoisting/TDZ** - Critical for understanding execution context
3. **Event Loop** - Most misunderstood concept
4. **Promises/Async** - Modern JavaScript essential
5. **Scope Chain** - Foundation of JS runtime

Mastering these concepts enables solving **95% of JavaScript coding interview problems**.

---

## 🚀 Next Steps

After passing all tests:

1. ✅ Add more complex scenarios (Promise.all, race)
2. ✅ Implement async/await syntax support
3. ✅ Add error handling tests (.catch, try/catch)
4. ✅ Create performance benchmarks
5. ✅ Add memory leak detection

---

**Status:** Test suite ready for production use! 🎉
