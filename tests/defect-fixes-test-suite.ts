import type { TestCase } from './test-runner'

export const defectFixesTestSuite: TestCase[] = [
  {
    name: 'FIX 1 — Infinite Recursion Protection',
    code: `
function rec() {
  rec();
}
rec();
`,
    expectedOutput: ['Maximum recursion depth reached: 50'],
  },
  {
    name: 'FIX 2 — Infinite Loop Protection',
    code: `
while(true) {
  // infinite loop
}
`,
    expectedOutput: ['Infinite loop detected: exceeded 500 iterations'],
  },
  {
    name: 'FIX 3 — Nested Timeouts',
    code: `
console.log("start");
setTimeout(() => {
  console.log("timeout 1");
  setTimeout(() => {
    console.log("timeout 2");
  }, 0);
}, 0);
console.log("end");
`,
    expectedOutput: ['start', 'end', 'timeout 1', 'timeout 2'],
  },
  {
    name: 'FIX 4 — Console.log in Microtasks',
    code: `
console.log("start");
Promise.resolve("promise result").then(val => {
  console.log(val);
});
console.log("end");
`,
    expectedOutput: ['start', 'end', 'promise result'],
  },
  {
    name: 'FIX 5 — Concurrent Console Operations',
    code: `
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve().then(() => console.log("microtask"));
console.log("sync");
`,
    expectedOutput: ['sync', 'microtask', 'macrotask'],
  },
  {
    name: 'FIX 6 — Simple Closure',
    code: `
function make() {
  let x = 10;
  return () => console.log(x);
}
const f = make();
f();
`,
    expectedOutput: ['10'],
  },
  {
    name: 'FIX 7 — For-Of Loop',
    code: `
const arr = [1, 2, 3];
for (const x of arr) {
  console.log(x);
}
`,
    expectedOutput: ['1', '2', '3'],
  },
  {
    name: 'FIX 8 — For-In Loop',
    code: `
const obj = { a: 1, b: 2 };
for (const k in obj) {
  console.log(k);
}
`,
    expectedOutput: ['a', 'b'],
  },
  {
    name: 'FIX 9 — Switch Statement and Break',
    code: `
const x = 2;
let result = '';
switch(x) {
  case 1: result = 'one'; break;
  case 2: result = 'two'; break;
  default: result = 'other';
}
console.log(result);
`,
    expectedOutput: ['two'],
  },
  {
    name: 'FIX 10 — While Loop and Break',
    code: `
let i = 0;
while(true) {
  if (i === 3) break;
  i++;
}
console.log(i);
`,
    expectedOutput: ['3'],
  },
  {
    name: 'FIX 11 — For Loop and Continue',
    code: `
let sum = 0;
for (let i = 0; i < 5; i++) {
  if (i % 2 === 0) continue;
  sum += i;
}
console.log(sum);
`,
    expectedOutput: ['4'],
  },
]
