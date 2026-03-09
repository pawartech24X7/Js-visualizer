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
  }
]
