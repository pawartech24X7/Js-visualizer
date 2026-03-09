import type { TestCase } from './TestRunner'

export const stressTestSuite: TestCase[] = [
  {
   name: 'TEST 1 — Nested Closures',
  code: `
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
console.log(fn())
`,
   expectedOutput: ['3']
  },
  
  {
   name: 'TEST 2 — Loop Closure Bug (var)',
  code: `
for(var i = 0; i < 3; i++){
  setTimeout(() => console.log(i), 0)
}
`,
   expectedOutput: ['3', '3', '3']
  },
  
  {
   name: 'TEST 3 — Loop Closure with let',
  code: `
for(let i = 0; i < 3; i++){
  setTimeout(() => console.log(i), 0)
}
`,
   expectedOutput: ['0', '1', '2']
  },
  
  {
   name: 'TEST 4 — Async Recursion',
  code: `
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
`,
   expectedOutput: ['3', '2', '1', 'done']
  },
  
  {
   name: 'TEST 5 — Promise Chain',
  code: `
Promise.resolve(1)
.then(x => x +1)
.then(x => x + 1)
.then(x => console.log(x))
`,
   expectedOutput: ['3']
  },
  
  {
   name: 'TEST 6 — TDZ Trap',
  code: `
try{
  console.log(a)
}catch(e){
  console.log("error")
}

let a = 5
`,
   expectedOutput: ['error']
  },
  
  {
   name: 'TEST 7 — Hoisting Trap',
  code: `
console.log(test())

function test(){
 return 42
}
`,
   expectedOutput: ['42']
  },
  
  {
   name: 'TEST 8 — Hoisting with var',
  code: `
console.log(x)

var x = 10
`,
   expectedOutput: ['undefined']
  },
  
  {
   name: 'TEST 9 — Event Loop Ordering',
  code: `
setTimeout(() => console.log("timeout"), 0)

Promise.resolve().then(() => console.log("promise"))

console.log("sync")
`,
   expectedOutput: ['sync', 'promise', 'timeout']
  },
  
  {
   name: 'TEST 10 — Async Await Order',
  code: `
async function test(){
  console.log("start")
  await Promise.resolve()
  console.log("after")
}

test()
console.log("end")
`,
   expectedOutput: ['start', 'end', 'after']
  },
  
  {
   name: 'TEST 11 — Object Reference Semantics',
  code: `
let obj = { value: 1 }

function modify(o){
  o.value = 2
}

modify(obj)

console.log(obj.value)
`,
   expectedOutput: ['2']
  },
  
  {
   name: 'TEST 12 — Recursive Stack',
  code: `
function factorial(n){
  if(n === 0) return 1
 return n * factorial(n - 1)
}

console.log(factorial(5))
`,
   expectedOutput: ['120']
  },
  
  {
   name: 'TEST 13 — Closure Memory Independence',
  code: `
function createCounter(){
  let count = 0
 return function(){
  count++
   return count
  }
}

const a = createCounter()
const b = createCounter()

console.log(a())
console.log(a())
console.log(b())
`,
   expectedOutput: ['1', '2', '1']
  },
  
  {
   name: 'TEST 14 — Nested Promise Microtasks',
  code: `
Promise.resolve()
.then(() => {
  console.log("A")
 return Promise.resolve()
})
.then(() => {
  console.log("B")
})

console.log("C")
`,
   expectedOutput: ['C', 'A', 'B']
  },
  
  {
   name: 'TEST 15 — setTimeout inside Promise',
  code: `
Promise.resolve().then(()=>{
  setTimeout(()=>console.log("timeout"),0)
})

console.log("end")
`,
   expectedOutput: ['end', 'timeout']
  },
  
  // =====================================================
  // EDGE CASE TESTS (Tests 16-35)
  // =====================================================
  
  {
  name: 'TEST 16 — Closure Shadowing',
  code: `
let x = 10

function outer(){
  let x = 20
 return function(){
  console.log(x)
  }
}

outer()()
`,
   expectedOutput: ['20']
  },
  
  {
  name: 'TEST 17 — Deep Nested Closure Chain',
  code: `
function a(){
  let x = 1
 return function b(){
   let y = 2
 return function c(){
  console.log(x + y)
    }
  }
}

a()()()
`,
   expectedOutput: ['3']
  },
  
  {
  name: 'TEST 18 — Function Inside Loop with var',
  code: `
for(var i=0;i<3;i++){
  setTimeout(function(){
  console.log(i)
  },0)
}
`,
   expectedOutput: ['3', '3', '3']
  },
  
  {
  name: 'TEST 19 — Function Inside Loop with let',
  code: `
for(let i=0;i<3;i++){
  setTimeout(function(){
  console.log(i)
  },0)
}
`,
   expectedOutput: ['0', '1', '2']
  },
  
  {
  name: 'TEST 20 — TDZ in Block',
  code: `
{
 try{
  console.log(a)
 }catch(e){
  console.log("tdz")
 }

 let a = 5
}
`,
   expectedOutput: ['tdz']
  },
  
  {
  name: 'TEST 21 — var Scope Leakage',
  code: `
function test(){
 if(true){
   var x = 5
 }
 console.log(x)
}

test()
`,
   expectedOutput: ['5']
  },
  
  {
  name: 'TEST 22 — let Block Scope Isolation',
  code: `
{
 let x = 5
}

try{
 console.log(x)
}catch(e){
 console.log("error")
}
`,
   expectedOutput: ['error']
  },
  
  {
  name: 'TEST 23 — Function Hoisting vs Variable',
  code: `
var test = 10

function test(){
 return 5
}

console.log(typeof test)
`,
   expectedOutput: ['number']
  },
  
  {
  name: 'TEST 24 — Nested Event Loop Ordering',
  code: `
setTimeout(()=>console.log("timeout1"),0)

Promise.resolve().then(()=>{
 console.log("promise")
})

setTimeout(()=>console.log("timeout2"),0)

console.log("sync")
`,
   expectedOutput: ['sync', 'promise', 'timeout1', 'timeout2']
  },
  
  {
  name: 'TEST 25 — Promise inside setTimeout',
  code: `
setTimeout(()=>{
 Promise.resolve().then(()=>console.log("micro"))
console.log("macro")
},0)
`,
   expectedOutput: ['macro', 'micro']
  },
  
  {
  name: 'TEST 26 — Async Await Chain',
  code: `
async function test(){
 console.log(1)
 await Promise.resolve()
console.log(2)
}

test()
console.log(3)
`,
   expectedOutput: ['1', '3', '2']
  },
  
  {
  name: 'TEST 27 — Object Reference Mutation',
  code: `
let obj = {a:1}

function mutate(o){
 o.a = 5
}

mutate(obj)

console.log(obj.a)
`,
   expectedOutput: ['5']
  },
  
  {
  name: 'TEST 28 — Array Reference Mutation',
  code: `
let arr = [1,2]

function add(a){
 a.push(3)
}

add(arr)

console.log(arr.length)
`,
   expectedOutput: ['3']
  },
  
  {
  name: 'TEST 29 — Closure State Persistence',
  code: `
function counter(){
 let count = 0
 return function(){
  count++
  console.log(count)
  }
}

const c = counter()

c()
c()
c()
`,
   expectedOutput: ['1', '2', '3']
  },
  
  {
  name: 'TEST 30 — Independent Closures',
  code: `
function counter(){
 let count = 0
 return function(){
  count++
 return count
  }
}

const a = counter()
const b = counter()

console.log(a())
console.log(a())
console.log(b())
`,
   expectedOutput: ['1', '2', '1']
  },
  
  {
  name: 'TEST 31 — Recursive Async',
  code: `
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
`,
   expectedOutput: ['2', '1', 'done']
  },
  
  {
  name: 'TEST 32 — Function Returning Function',
  code: `
function outer(){
 return function(){
  console.log("hello")
  }
}

outer()()
`,
   expectedOutput: ['hello']
  },
  
  {
  name: 'TEST 33 — Promise Chain with Return',
  code: `
Promise.resolve(1)
.then(x=>x+1)
.then(x=>{
 console.log(x)
 return x+1
})
.then(x=>console.log(x))
`,
   expectedOutput: ['2', '3']
  },
  
  {
  name: 'TEST 34 — Nested Microtasks',
  code: `
Promise.resolve().then(()=>{
 console.log("A")
 Promise.resolve().then(()=>console.log("B"))
})

console.log("C")
`,
   expectedOutput: ['C', 'A', 'B']
  },
  
  {
  name: 'TEST 35 — setTimeout Nested',
  code: `
setTimeout(()=>{
 console.log("A")
 setTimeout(()=>console.log("B"),0)
},0)
`,
   expectedOutput: ['A', 'B']
  }
]
