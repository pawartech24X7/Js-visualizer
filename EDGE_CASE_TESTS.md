# Edge Case Tests Documentation (Tests 16-35)

## Overview

This document details the **20 additional edge-case tests** added to validate the JavaScript interpreter's robustness with tricky scenarios that commonly break interpreters.

---

## Test Breakdown

### **Closure & Scope Edge Cases (Tests 16-17, 29-30, 32)**

#### TEST 16 — Closure Shadowing
**Purpose:** Validates that inner scopes properly shadow outer variables  
**Code:**
```javascript
let x = 10

function outer(){
  let x = 20
 return function(){
  console.log(x)
  }
}

outer()() // Expected: 20
```
**Validates:**
- ✅ Inner `let x` shadows outer `x`
- ✅ Closure captures correct environment
- ✅ Function call chain works correctly

---

#### TEST 17 — Deep Nested Closure Chain
**Purpose:** Three-level closure chain with variable access  
**Code:**
```javascript
function a(){
  let x = 1
 return function b(){
   let y = 2
 return function c(){
  console.log(x + y)
    }
  }
}

a()()() // Expected: 3
```
**Validates:**
- ✅ Multi-level scope chain traversal
- ✅ Access to grandparent environment
- ✅ Correct lexical environment resolution

---

#### TEST 29 — Closure State Persistence
**Purpose:** Closure maintains state across multiple calls  
**Code:**
```javascript
function counter(){
 let count = 0
 return function(){
  count++
  console.log(count)
  }
}

const c = counter()
c() // 1
c() // 2
c() // 3
```
**Validates:**
- ✅ Captured environment persists between calls
- ✅ State mutations are preserved
- ✅ Console output from closures

---

#### TEST 30 — Independent Closures
**Purpose:** Multiple closures maintain independent state  
**Code:**
```javascript
function counter(){
 let count = 0
 return function(){
  count++
 return count
  }
}

const a = counter()
const b = counter()

console.log(a()) // 1
console.log(a()) // 2
console.log(b()) // 1
```
**Validates:**
- ✅ Each closure has separate captured environment
- ✅ No cross-contamination
- ✅ Critical for factory functions

---

#### TEST 32 — Function Returning Function
**Purpose:** Basic higher-order function  
**Code:**
```javascript
function outer(){
 return function(){
  console.log("hello")
  }
}

outer()() // Expected: hello
```
**Validates:**
- ✅ Functions can return functions
- ✅ Returned function can be invoked immediately
- ✅ Proper execution context handling

---

### **Loop Closure Bugs (Tests 18-19)**

#### TEST 18 — Function Inside Loop with var
**Purpose:** Classic interview bug - shared binding  
**Code:**
```javascript
for(var i=0;i<3;i++){
  setTimeout(function(){
  console.log(i)
  },0)
}
// Expected: 3, 3, 3
```
**Validates:**
- ✅ `var` creates single shared binding
- ✅ All callbacks reference same variable
- ✅ Loop completes before callbacks execute

---

#### TEST 19 — Function Inside Loop with let
**Purpose:** Per-iteration binding with let  
**Code:**
```javascript
for(let i=0;i<3;i++){
  setTimeout(function(){
  console.log(i)
  },0)
}
// Expected: 0, 1, 2
```
**Validates:**
- ✅ `let` creates fresh binding per iteration
- ✅ Each callback captures correct iteration value
- ✅ Block scoping in loops

---

### **TDZ & Hoisting Edge Cases (Tests 20-23)**

#### TEST 20 — TDZ in Block
**Purpose:** TDZ enforced within block scope  
**Code:**
```javascript
{
 try{
  console.log(a)
 }catch(e){
  console.log("tdz")
 }

 let a = 5
}
// Expected: tdz
```
**Validates:**
- ✅ TDZ exists in block scope
- ✅ Error thrown when accessing uninitialized binding
- ✅ Try/catch handles TDZ error

---

#### TEST 21 — var Scope Leakage
**Purpose:** var leaks outside if block  
**Code:**
```javascript
function test(){
 if(true){
   var x = 5
 }
 console.log(x) // 5
}

test()
```
**Validates:**
- ✅ `var` is function-scoped, not block-scoped
- ✅ Variable accessible outside if block
- ✅ Function scope contains all vars

---

#### TEST 22 — let Block Scope Isolation
**Purpose:** let confined to block  
**Code:**
```javascript
{
 let x = 5
}

try{
 console.log(x)
}catch(e){
 console.log("error")
}
// Expected: error
```
**Validates:**
- ✅ `let` scoped to block
- ✅ Variable destroyed when block exits
- ✅ ReferenceError when accessing outside

---

#### TEST 23 — Function Hoisting vs Variable
**Purpose:** Function declaration hoisted before var assignment  
**Code:**
```javascript
var test = 10

function test(){
 return 5
}

console.log(typeof test) // number
```
**Validates:**
- ✅ Function hoisted first
- ✅ Then `var test = 10` overwrites it
- ✅ Final type is number, not function

---

### **Event Loop Complexity (Tests 24-25, 34-35)**

#### TEST 24 — Nested Event Loop Ordering
**Purpose:** Multiple macrotasks and microtasks  
**Code:**
```javascript
setTimeout(()=>console.log("timeout1"),0)
Promise.resolve().then(()=>console.log("promise"))
setTimeout(()=>console.log("timeout2"),0)
console.log("sync")
// Expected: sync, promise, timeout1, timeout2
```
**Validates:**
- ✅ Sync code first
- ✅ Microtasks before any macrotasks
- ✅ Macrotasks processed in FIFO order

---

#### TEST 25 — Promise inside setTimeout
**Purpose:** Microtask scheduled from macrotask  
**Code:**
```javascript
setTimeout(()=>{
 Promise.resolve().then(()=>console.log("micro"))
console.log("macro")
},0)
// Expected: macro, micro
```
**Validates:**
- ✅ Macrotask executes completely
- ✅ Synchronous code in macrotask runs first
- ✅ Promise microtask queued after macrotask finishes

---

#### TEST 34 — Nested Microtasks
**Purpose:** Microtask scheduling another microtask  
**Code:**
```javascript
Promise.resolve().then(()=>{
 console.log("A")
 Promise.resolve().then(()=>console.log("B"))
})

console.log("C")
// Expected: C, A, B
```
**Validates:**
- ✅ First microtask runs after sync code
- ✅ Nested microtask queued during microtask processing
- ✅ Correct ordering maintained

---

#### TEST 35 — setTimeout Nested
**Purpose:** Macrotask scheduling another macrotask  
**Code:**
```javascript
setTimeout(()=>{
 console.log("A")
 setTimeout(()=>console.log("B"),0)
},0)
// Expected: A, B
```
**Validates:**
- ✅ Outer macrotask executes
- ✅ Inner macrotask queued
- ✅ Second macrotask executes after first

---

### **Async/Await Patterns (Tests 26, 31)**

#### TEST 26 — Async Await Chain
**Purpose:** Async function with external synchronous code  
**Code:**
```javascript
async function test(){
 console.log(1)
 await Promise.resolve()
console.log(2)
}

test()
console.log(3)
// Expected: 1, 3, 2
```
**Validates:**
- ✅ Async function starts synchronously
- ✅ Code after await goes to microtask queue
- ✅ External sync code runs before microtasks

---

#### TEST 31 — Recursive Async
**Purpose:** Recursive function with await  
**Code:**
```javascript
async function f(n){
 if(n===0){
  console.log("done")
 return
  }
 console.log(n)
 await Promise.resolve()
 return f(n-1)
}

f(2)
// Expected: 2, 1, done
```
**Validates:**
- ✅ Async recursion works correctly
- ✅ Each recursive call creates new microtask
- ✅ Base case terminates properly

---

### **Reference Semantics (Tests 27-28)**

#### TEST 27 — Object Reference Mutation
**Purpose:** Objects mutated through reference  
**Code:**
```javascript
let obj = {a:1}

function mutate(o){
 o.a = 5
}

mutate(obj)
console.log(obj.a) // 5
```
**Validates:**
- ✅ Objects passed by reference
- ✅ Property mutation affects original
- ✅ Reference semantics preserved

---

#### TEST 28 — Array Reference Mutation
**Purpose:** Arrays mutated through reference  
**Code:**
```javascript
let arr = [1,2]

function add(a){
 a.push(3)
}

add(arr)
console.log(arr.length) // 3
```
**Validates:**
- ✅ Arrays are objects (references)
- ✅ Method calls affect original array
- ✅ Length property updates correctly

---

### **Promise Chains (TEST 33)**

#### TEST 33 — Promise Chain with Return
**Purpose:** Multiple .then() with returns  
**Code:**
```javascript
Promise.resolve(1)
.then(x=>x+1)
.then(x=>{
 console.log(x) // 2
 return x+1
})
.then(x=>console.log(x)) // 3
```
**Validates:**
- ✅ Return values wrapped in promises
- ✅ Chain continues with new value
- ✅ Multiple console outputs in chain

---

## Coverage Summary

| Category | Tests | What's Tested |
|----------|-------|---------------|
| **Closures** | 16, 17, 29, 30, 32 | Shadowing, deep chains, state persistence, independence |
| **Loop Closures** | 18, 19 | var vs let behavior in loops |
| **TDZ/Hoisting** | 20, 21, 22, 23 | Block TDZ, var leakage, let isolation, hoisting priority |
| **Event Loop** | 24, 25, 34, 35 | Complex ordering, nested tasks |
| **Async/Await** | 26, 31 | Timing, recursion |
| **References** | 27, 28 | Object/array mutation |
| **Promises** | 33 | Chain with returns |

---

## Running the Tests

### Browser Console
```javascript
// After starting dev server
window.runInterpreterTests(stressTestSuite)
```

### Expected Results
**Pass Criteria:** 35/35 tests passing (100%)

**Breakdown:**
- Tests 1-15: Core functionality
- Tests 16-35: Edge cases

---

## Common Failure Patterns

### If Tests 18-19 Fail (Loop Closures)
**Issue:** Block scoping or closure capture broken  
**Fix:** Check `for` statement creates proper environments

### If Tests 20-22 Fail (TDZ/Block Scope)
**Issue:** TDZ or block environment creation broken  
**Fix:** Check block statement creates/disposes environments

### If Tests 24-25 Fail (Event Loop)
**Issue:** Microtask/macrotask ordering wrong  
**Fix:** Check event loop processes microtasks first

### If Tests 27-28 Fail (References)
**Issue:** Objects being copied instead of referenced  
**Fix:** Check object/array assignment creates references

---

## Why These Tests Matter

These 20 edge cases cover **the most misunderstood JavaScript concepts**:

1. **Closures in loops** - #1 interview question
2. **TDZ behavior** - Critical for understanding let/const
3. **Hoisting priority** - Function vs variable declarations
4. **Event loop complexity** - Real-world async patterns
5. **Reference semantics** - Objects vs primitives
6. **Nested async** - Modern JavaScript patterns

Mastering these enables solving **advanced JavaScript problems**!

---

**Status:** ✅ 20 edge case tests added successfully!
