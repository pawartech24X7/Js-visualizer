import type { Topic } from '@/types'

export const topics: Topic[] = [
  // FUNDAMENTALS & SYNTAX
  {
    id: 'var-let-const',
    category: 'fundamentals',
    title: 'var, let, const',
    description: 'Variable declarations and their differences',
    icon: 'Variable',
    subTopics: [
      { id: 'var-hoisting', title: 'var Hoisting', description: 'How var declarations are hoisted' },
      { id: 'let-block-scope', title: 'let Block Scope', description: 'Block scoping with let' },
      { id: 'const-immutability', title: 'const Immutability', description: 'Constants and reference types' },
      { id: 'tdz', title: 'Temporal Dead Zone', description: 'TDZ for let and const' },
    ],
    explanation: `## Variable Declarations in JavaScript

### var
- Function-scoped or globally-scoped
- Hoisted to the top of its scope
- Can be re-declared and updated
- Initialized as undefined during hoisting

### let
- Block-scoped (within {})
- Not accessible before declaration (TDZ)
- Can be updated but not re-declared in same scope
- Better for loop counters

### const
- Block-scoped like let
- Must be initialized at declaration
- Cannot be reassigned
- Objects/arrays can still be mutated`,
    codeExample: `// var - function scoped, hoisted
console.log(x); // undefined (hoisted)
var x = 10;

// let - block scoped, TDZ
// console.log(y); // ReferenceError!
let y = 20;

// const - must be initialized, cannot reassign
const PI = 3.14159;
// PI = 3; // TypeError!

// But objects can be mutated
const obj = { a: 1 };
obj.a = 2; // OK!
obj.b = 3; // OK!`,
    interviewQuestions: [
      'What is the difference between var, let, and const?',
      'Explain the Temporal Dead Zone (TDZ)',
      'Why is const not truly immutable for objects?',
      'What happens when you declare a variable without var, let, or const?',
    ],
  },
  {
    id: 'data-types',
    category: 'fundamentals',
    title: 'Data Types',
    description: 'Primitive vs Reference types',
    icon: 'Database',
    subTopics: [
      { id: 'primitives', title: 'Primitive Types', description: 'string, number, boolean, null, undefined, symbol, bigint' },
      { id: 'reference', title: 'Reference Types', description: 'Objects, Arrays, Functions' },
      { id: 'typeof', title: 'typeof Operator', description: 'Checking types at runtime' },
    ],
    explanation: `## JavaScript Data Types

### Primitive Types (Immutable, stored by value)
- **string**: Text data
- **number**: Integers and floats (64-bit)
- **boolean**: true or false
- **null**: Intentional absence of value
- **undefined**: Uninitialized variable
- **symbol**: Unique identifier
- **bigint**: Large integers

### Reference Types (Mutable, stored by reference)
- **Object**: Key-value pairs
- **Array**: Ordered collection
- **Function**: Callable object

### Key Difference
Primitives are copied by value, references are copied by reference (memory address).`,
    codeExample: `// Primitives - copied by value
let a = 5;
let b = a;
b = 10;
console.log(a); // 5 (unchanged)

// References - copied by reference
let arr1 = [1, 2, 3];
let arr2 = arr1;
arr2.push(4);
console.log(arr1); // [1, 2, 3, 4] (changed!)

// typeof operator
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" (historical bug!)
typeof {}         // "object"
typeof []         // "object"
typeof function(){} // "function"`,
    interviewQuestions: [
      'What are the primitive types in JavaScript?',
      'Why does typeof null return "object"?',
      'Explain the difference between primitive and reference types',
      'How would you check if a variable is an array?',
    ],
  },
  {
    id: 'type-coercion',
    category: 'fundamentals',
    title: 'Type Coercion',
    description: 'Implicit and explicit type conversion',
    icon: 'ArrowRightLeft',
    subTopics: [
      { id: 'implicit', title: 'Implicit Coercion', description: 'Automatic type conversion' },
      { id: 'explicit', title: 'Explicit Coercion', description: 'Manual type conversion' },
      { id: 'equality', title: '== vs ===', description: 'Loose vs strict equality' },
    ],
    explanation: `## Type Coercion

### Implicit Coercion
JavaScript automatically converts types in certain contexts:
- String concatenation with +
- Numeric operations
- Boolean contexts (if, while, &&, ||)

### Explicit Coercion
Manual conversion using:
- String(), Number(), Boolean()
- parseInt(), parseFloat()
- .toString()

### Equality Operators
- **==** (loose): Converts types before comparing
- **===** (strict): No type conversion, must match type and value`,
    codeExample: `// Implicit coercion
"5" + 3        // "53" (number to string)
"5" - 3        // 2 (string to number)
"5" * "2"      // 10 (both to numbers)
!!"hello"      // true (to boolean)
!!0            // false

// Explicit coercion
String(123)    // "123"
Number("42")   // 42
Boolean("")    // false
parseInt("42px") // 42

// == vs ===
"5" == 5       // true (coercion)
"5" === 5      // false (different types)
null == undefined  // true
null === undefined // false`,
    interviewQuestions: [
      'What is the difference between == and ===?',
      'What are truthy and falsy values?',
      'Explain implicit type coercion with examples',
      'Why is [] == false true but [] === false false?',
    ],
  },
  {
    id: 'operators',
    category: 'fundamentals',
    title: 'Operators',
    description: 'Arithmetic, logical, and special operators',
    icon: 'Calculator',
    subTopics: [
      { id: 'nullish', title: 'Nullish Coalescing', description: '?? operator' },
      { id: 'optional-chain', title: 'Optional Chaining', description: '?. operator' },
      { id: 'spread-rest', title: 'Spread/Rest', description: '... operator' },
    ],
    explanation: `## JavaScript Operators

### Nullish Coalescing (??)
Returns right side only if left is null or undefined (not for falsy values like 0 or "").

### Optional Chaining (?.)
Safely access nested properties without throwing errors if a property is null/undefined.

### Spread Operator (...)
Expands iterables into individual elements.

### Rest Parameters (...)
Collects multiple arguments into an array.`,
    codeExample: `// Nullish coalescing
const value = null ?? "default"; // "default"
const zero = 0 ?? "default";     // 0 (not null!)
const empty = "" || "default";   // "default"
const empty2 = "" ?? "default";  // "" (not null!)

// Optional chaining
const user = { profile: { name: "John" } };
user?.profile?.name    // "John"
user?.settings?.theme  // undefined (no error!)
user?.getAge?.()       // undefined (safe function call)

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]
const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

// Rest parameters
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10`,
    interviewQuestions: [
      'What is the difference between || and ??',
      'How does optional chaining prevent errors?',
      'Explain the difference between spread and rest operators',
      'Can you use spread on objects? What happens with duplicate keys?',
    ],
  },

  // CONTROL FLOW
  {
    id: 'conditionals',
    category: 'control-flow',
    title: 'Conditionals',
    description: 'if/else, switch, ternary',
    icon: 'GitBranch',
    subTopics: [
      { id: 'if-else', title: 'if/else', description: 'Basic conditional branching' },
      { id: 'switch', title: 'switch', description: 'Multiple condition matching' },
      { id: 'ternary', title: 'Ternary', description: 'Inline conditional expression' },
    ],
    explanation: `## Conditional Statements

### if/else
The fundamental branching construct. Evaluates conditions as truthy/falsy.

### switch
Better for multiple exact value comparisons. Uses strict equality (===).
Don't forget break statements!

### Ternary Operator
condition ? valueIfTrue : valueIfFalse
Great for simple inline conditions.`,
    codeExample: `// if/else
const age = 18;
if (age >= 21) {
  console.log("Can drink");
} else if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}

// switch
const day = "Monday";
switch (day) {
  case "Monday":
  case "Tuesday":
    console.log("Weekday");
    break;
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  default:
    console.log("Unknown");
}

// Ternary
const status = age >= 18 ? "adult" : "minor";
const message = user?.name ?? "Guest";`,
    interviewQuestions: [
      'When would you use switch over if/else?',
      'What happens if you forget break in a switch?',
      'Can you nest ternary operators? Should you?',
      'How does switch handle type comparison?',
    ],
  },
  {
    id: 'loops',
    category: 'control-flow',
    title: 'Loops',
    description: 'for, while, for...of, for...in',
    icon: 'Repeat',
    subTopics: [
      { id: 'for-loop', title: 'for Loop', description: 'Classic iteration with counter' },
      { id: 'for-of', title: 'for...of', description: 'Iterate over iterables' },
      { id: 'for-in', title: 'for...in', description: 'Iterate over object keys' },
      { id: 'while', title: 'while/do-while', description: 'Condition-based loops' },
    ],
    explanation: `## JavaScript Loops

### for Loop
Classic counter-based iteration. Best when you need the index.

### for...of
Iterates over iterable values (arrays, strings, Maps, Sets).
Cannot directly access index.

### for...in
Iterates over enumerable property KEYS (including inherited).
Use with caution on arrays!

### while / do-while
Condition-checked loops. do-while always runs at least once.`,
    codeExample: `const arr = ["a", "b", "c"];

// Classic for loop
for (let i = 0; i < arr.length; i++) {
  console.log(i, arr[i]);
}

// for...of (values)
for (const value of arr) {
  console.log(value); // "a", "b", "c"
}

// for...in (keys/indices)
for (const key in arr) {
  console.log(key); // "0", "1", "2"
}

// for...in on objects
const obj = { x: 1, y: 2 };
for (const key in obj) {
  console.log(key, obj[key]);
}

// while
let i = 0;
while (i < 3) {
  console.log(i++);
}

// do-while (runs at least once)
do {
  console.log("Runs once!");
} while (false);`,
    interviewQuestions: [
      'What is the difference between for...of and for...in?',
      'Why should you avoid for...in on arrays?',
      'How do break and continue work in loops?',
      'How can you iterate over an object with for...of?',
    ],
  },

  // FUNCTIONS & EXECUTION CONTEXT
  {
    id: 'function-types',
    category: 'functions',
    title: 'Function Types',
    description: 'Declaration, expression, arrow',
    icon: 'Code',
    subTopics: [
      { id: 'declaration', title: 'Declaration', description: 'function name() {}' },
      { id: 'expression', title: 'Expression', description: 'const fn = function() {}' },
      { id: 'arrow', title: 'Arrow Functions', description: '() => {}' },
      { id: 'iife', title: 'IIFE', description: 'Immediately Invoked Function Expression' },
    ],
    explanation: `## Function Types

### Function Declaration
- Hoisted completely (can call before definition)
- Has its own this binding
- Can be named for recursion

### Function Expression
- Not hoisted (variable is, but not the function)
- Can be anonymous or named
- Useful for callbacks

### Arrow Functions
- Concise syntax
- Lexical this (inherits from parent scope)
- Cannot be used as constructors
- No arguments object`,
    codeExample: `// Function Declaration (hoisted)
sayHello(); // Works!
function sayHello() {
  console.log("Hello!");
}

// Function Expression (not hoisted)
// greet(); // Error!
const greet = function() {
  console.log("Hi!");
};

// Arrow Function
const add = (a, b) => a + b;
const square = x => x * x;
const log = () => console.log("Log");

// Arrow vs regular this
const obj = {
  name: "Object",
  regular: function() {
    console.log(this.name); // "Object"
  },
  arrow: () => {
    console.log(this.name); // undefined!
  }
};

// IIFE
(function() {
  const private = "secret";
  console.log("Runs immediately!");
})();`,
    interviewQuestions: [
      'What is the difference between function declarations and expressions?',
      'Why do arrow functions not have their own this?',
      'When should you NOT use arrow functions?',
      'What is an IIFE and why would you use one?',
    ],
  },
  {
    id: 'closures',
    category: 'functions',
    title: 'Closures',
    description: 'Functions that remember their scope',
    icon: 'Lock',
    subTopics: [
      { id: 'lexical-scope', title: 'Lexical Scope', description: 'Scope determined at write time' },
      { id: 'closure-memory', title: 'Closure Memory', description: 'Variables kept in memory' },
      { id: 'practical-uses', title: 'Practical Uses', description: 'Data privacy, factories' },
    ],
    explanation: `## Closures

A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.

### How Closures Work
1. Functions are created with a reference to their lexical environment
2. The inner function "closes over" the variables it needs
3. These variables are kept in memory as long as the closure exists

### Use Cases
- Data privacy / encapsulation
- Function factories
- Callbacks with state
- Module pattern`,
    codeExample: `// Basic closure
function outer() {
  const message = "Hello";
  
  function inner() {
    console.log(message); // Has access!
  }
  
  return inner;
}

const fn = outer();
fn(); // "Hello" - closure remembers message!

// Counter factory
function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
// count is not accessible directly!

// Common pitfall: loop closures
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 3, 3, 3 (not 0, 1, 2!)

// Fix with let (block scope)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 0, 1, 2`,
    interviewQuestions: [
      'What is a closure and how does it work?',
      'Explain the loop closure problem and how to fix it',
      'How can closures be used to create private variables?',
      'What are the memory implications of closures?',
    ],
  },
  {
    id: 'hoisting',
    category: 'functions',
    title: 'Hoisting',
    description: 'How declarations are moved to the top',
    icon: 'ArrowUp',
    subTopics: [
      { id: 'var-hoisting', title: 'var Hoisting', description: 'Declaration hoisted, not initialization' },
      { id: 'function-hoisting', title: 'Function Hoisting', description: 'Entire function is hoisted' },
      { id: 'let-const', title: 'let/const TDZ', description: 'Temporal Dead Zone' },
    ],
    explanation: `## Hoisting

Hoisting is JavaScript's default behavior of moving declarations to the top of their scope during the compilation phase.

### var Hoisting
- Declaration is hoisted
- Initialization stays in place
- Value is undefined until assignment

### Function Declaration Hoisting
- Entire function is hoisted
- Can be called before its definition

### let/const (Temporal Dead Zone)
- Declarations are hoisted but not initialized
- Accessing before declaration throws ReferenceError
- The time between scope start and declaration is called TDZ`,
    codeExample: `// How JavaScript sees var hoisting:
// var x;  <- hoisted declaration
console.log(x); // undefined
var x = 5;
console.log(x); // 5

// Function declaration hoisting
sayHi(); // "Hi!" - works!
function sayHi() {
  console.log("Hi!");
}

// Function expression - NOT hoisted
// greet(); // TypeError: greet is not a function
var greet = function() {
  console.log("Hello!");
};

// let/const - Temporal Dead Zone
// console.log(name); // ReferenceError!
let name = "John";
console.log(name); // "John"

// TDZ even exists within blocks
{
  // TDZ starts here
  // console.log(x); // ReferenceError!
  let x = 10;
  // TDZ ends after declaration
  console.log(x); // 10
}`,
    interviewQuestions: [
      'What is hoisting and how does it work?',
      'What is the Temporal Dead Zone (TDZ)?',
      'Why is hoisting different for var vs let/const?',
      'Are function expressions hoisted?',
    ],
  },
  {
    id: 'higher-order-functions',
    category: 'functions',
    title: 'Higher-Order Functions',
    description: 'Functions that operate on other functions',
    icon: 'Layers',
    subTopics: [
      { id: 'callbacks', title: 'Callbacks', description: 'Functions passed as arguments' },
      { id: 'returning-functions', title: 'Returning Functions', description: 'Functions that return functions' },
      { id: 'functional-patterns', title: 'Functional Patterns', description: 'map, filter, reduce' },
    ],
    explanation: `## Higher-Order Functions

A higher-order function is a function that:
1. Takes one or more functions as arguments, OR
2. Returns a function as its result

### Common Examples
- Array methods: map, filter, reduce, forEach
- Function factories
- Decorators/wrappers
- Event handlers`,
    codeExample: `// Taking function as argument (callback)
function doOperation(a, b, operation) {
  return operation(a, b);
}

const add = (x, y) => x + y;
const multiply = (x, y) => x * y;

doOperation(5, 3, add);      // 8
doOperation(5, 3, multiply); // 15

// Returning a function
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);
double(5); // 10
triple(5); // 15

// Array higher-order functions
const numbers = [1, 2, 3, 4, 5];

// map - transform each element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter - keep elements that pass test
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce - accumulate to single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15`,
    interviewQuestions: [
      'What makes a function "higher-order"?',
      'Explain map, filter, and reduce with examples',
      'How would you implement your own map function?',
      'What is function composition?',
    ],
  },

  // ARRAYS & OBJECTS
  {
    id: 'array-methods',
    category: 'arrays-objects',
    title: 'Array Methods',
    description: 'Essential array manipulation methods',
    icon: 'List',
    subTopics: [
      { id: 'mutating', title: 'Mutating Methods', description: 'push, pop, shift, splice' },
      { id: 'non-mutating', title: 'Non-Mutating', description: 'map, filter, slice, concat' },
      { id: 'searching', title: 'Searching', description: 'find, findIndex, includes' },
    ],
    explanation: `## Array Methods

### Mutating Methods (modify original array)
- push/pop: Add/remove from end
- shift/unshift: Remove/add from beginning
- splice: Add/remove at any position
- sort: Sort in place
- reverse: Reverse in place

### Non-Mutating Methods (return new array)
- map: Transform each element
- filter: Keep elements matching condition
- slice: Extract portion
- concat: Merge arrays
- flat: Flatten nested arrays

### Searching Methods
- find: First matching element
- findIndex: Index of first match
- includes: Check if element exists
- indexOf: Index of element`,
    codeExample: `const arr = [1, 2, 3, 4, 5];

// Mutating methods
arr.push(6);           // [1,2,3,4,5,6]
arr.pop();             // [1,2,3,4,5], returns 6
arr.unshift(0);        // [0,1,2,3,4,5]
arr.shift();           // [1,2,3,4,5], returns 0
arr.splice(2, 1, 'a'); // [1,2,'a',4,5]

// Non-mutating methods
const nums = [1, 2, 3, 4, 5];
nums.map(n => n * 2);        // [2,4,6,8,10]
nums.filter(n => n > 2);     // [3,4,5]
nums.slice(1, 3);            // [2,3]
nums.concat([6, 7]);         // [1,2,3,4,5,6,7]

// Searching
nums.find(n => n > 3);       // 4
nums.findIndex(n => n > 3);  // 3
nums.includes(3);            // true
nums.indexOf(3);             // 2

// Reduce
nums.reduce((sum, n) => sum + n, 0); // 15

// Some & Every
nums.some(n => n > 4);       // true
nums.every(n => n > 0);      // true`,
    interviewQuestions: [
      'What is the difference between map and forEach?',
      'Which array methods mutate the original array?',
      'How does reduce work? Give an example',
      'Difference between find and filter?',
    ],
  },
  {
    id: 'destructuring',
    category: 'arrays-objects',
    title: 'Destructuring',
    description: 'Extract values from arrays and objects',
    icon: 'Ungroup',
    subTopics: [
      { id: 'array-destructure', title: 'Array Destructuring', description: 'Extract by position' },
      { id: 'object-destructure', title: 'Object Destructuring', description: 'Extract by key name' },
      { id: 'nested', title: 'Nested Destructuring', description: 'Deep extraction' },
    ],
    explanation: `## Destructuring Assignment

Destructuring allows you to extract values from arrays or properties from objects into distinct variables.

### Array Destructuring
- Extract by position
- Can skip elements
- Can use rest operator
- Can set defaults

### Object Destructuring
- Extract by property name
- Can rename variables
- Can set defaults
- Can be nested`,
    codeExample: `// Array destructuring
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// Skip elements
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1 3

// Rest pattern
const [head, ...tail] = [1, 2, 3, 4];
console.log(head, tail); // 1 [2,3,4]

// Default values
const [x = 10, y = 20] = [5];
console.log(x, y); // 5 20

// Object destructuring
const user = { name: "John", age: 30, city: "NYC" };
const { name, age } = user;
console.log(name, age); // "John" 30

// Rename variables
const { name: userName, age: userAge } = user;
console.log(userName, userAge); // "John" 30

// Nested destructuring
const data = {
  user: { name: "John", address: { city: "NYC" } }
};
const { user: { address: { city } } } = data;
console.log(city); // "NYC"

// Function parameters
function greet({ name, age = 0 }) {
  console.log(\`\${name} is \${age}\`);
}
greet({ name: "John", age: 30 });`,
    interviewQuestions: [
      'How do you swap variables using destructuring?',
      'Can you destructure nested objects?',
      'How do you set default values in destructuring?',
      'How do you rename variables during destructuring?',
    ],
  },
  {
    id: 'maps-sets',
    category: 'arrays-objects',
    title: 'Maps & Sets',
    description: 'ES6 collection types',
    icon: 'Database',
    subTopics: [
      { id: 'map', title: 'Map', description: 'Key-value pairs with any key type' },
      { id: 'set', title: 'Set', description: 'Unique values collection' },
      { id: 'weakmap-weakset', title: 'WeakMap/WeakSet', description: 'Garbage-collectable collections' },
    ],
    explanation: `## Maps and Sets

### Map
- Key-value pairs where keys can be ANY type
- Maintains insertion order
- Has size property
- Better performance for frequent add/delete

### Set
- Collection of unique values
- No duplicates allowed
- Maintains insertion order
- Great for removing duplicates

### WeakMap/WeakSet
- Keys must be objects
- Keys are weakly held (can be garbage collected)
- Not iterable`,
    codeExample: `// Map
const map = new Map();
map.set("name", "John");
map.set(1, "one");
map.set({ id: 1 }, "object key");

map.get("name");    // "John"
map.has("name");    // true
map.size;           // 3
map.delete("name");

// Iterate Map
for (const [key, value] of map) {
  console.log(key, value);
}

// Set
const set = new Set([1, 2, 3, 3, 3]);
console.log(set); // Set {1, 2, 3}

set.add(4);
set.has(2);       // true
set.delete(1);
set.size;         // 3

// Remove duplicates from array
const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)]; // [1, 2, 3]

// Set operations
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

// Union
const union = new Set([...a, ...b]); // {1,2,3,4}

// Intersection
const intersection = new Set(
  [...a].filter(x => b.has(x))
); // {2, 3}`,
    interviewQuestions: [
      'What is the difference between Map and Object?',
      'How do you remove duplicates from an array using Set?',
      'When would you use WeakMap over Map?',
      'Can you iterate over a Map? In what order?',
    ],
  },

  // ASYNCHRONOUS JAVASCRIPT
  {
    id: 'event-loop',
    category: 'async',
    title: 'Event Loop',
    description: 'How JavaScript handles async operations',
    icon: 'RefreshCw',
    subTopics: [
      { id: 'call-stack', title: 'Call Stack', description: 'LIFO execution stack' },
      { id: 'task-queue', title: 'Task Queue', description: 'Macrotask queue (setTimeout)' },
      { id: 'microtask-queue', title: 'Microtask Queue', description: 'Promise callbacks' },
    ],
    explanation: `## The Event Loop

JavaScript is single-threaded but handles async operations through the event loop.

### Components
1. **Call Stack**: Where function execution happens (LIFO)
2. **Web APIs**: Browser APIs for async (setTimeout, fetch, DOM)
3. **Task Queue** (Macrotasks): setTimeout, setInterval, I/O
4. **Microtask Queue**: Promises, queueMicrotask, MutationObserver

### Event Loop Cycle
1. Execute synchronous code on call stack
2. When stack is empty, process ALL microtasks
3. Process ONE macrotask
4. Go back to step 2

**Key Rule**: Microtasks have priority over macrotasks!`,
    codeExample: `console.log("1: Start");

setTimeout(() => {
  console.log("2: Timeout");
}, 0);

Promise.resolve()
  .then(() => console.log("3: Promise 1"))
  .then(() => console.log("4: Promise 2"));

console.log("5: End");

// Output order:
// 1: Start
// 5: End
// 3: Promise 1
// 4: Promise 2
// 2: Timeout

// Why? Event loop execution:
// 1. Sync: log "Start"
// 2. setTimeout callback -> Task Queue
// 3. Promise callbacks -> Microtask Queue
// 4. Sync: log "End"
// 5. Stack empty -> Drain Microtask Queue
//    - log "Promise 1"
//    - log "Promise 2"
// 6. Execute one macrotask
//    - log "Timeout"`,
    interviewQuestions: [
      'Explain the event loop in JavaScript',
      'What is the difference between microtasks and macrotasks?',
      'Why does Promise.then run before setTimeout?',
      'What happens if a microtask schedules another microtask?',
    ],
  },
  {
    id: 'promises',
    category: 'async',
    title: 'Promises',
    description: 'Handling asynchronous operations',
    icon: 'Clock',
    subTopics: [
      { id: 'promise-states', title: 'Promise States', description: 'pending, fulfilled, rejected' },
      { id: 'then-catch', title: 'then/catch/finally', description: 'Handling results' },
      { id: 'promise-methods', title: 'Static Methods', description: 'all, race, allSettled' },
    ],
    explanation: `## Promises

A Promise represents the eventual completion or failure of an async operation.

### States
- **pending**: Initial state
- **fulfilled**: Operation completed successfully
- **rejected**: Operation failed

### Methods
- **.then(onFulfilled, onRejected)**: Handle success/failure
- **.catch(onRejected)**: Handle errors
- **.finally(callback)**: Always runs

### Static Methods
- **Promise.all()**: Wait for all, fail on first rejection
- **Promise.race()**: First to settle wins
- **Promise.allSettled()**: Wait for all, get all results
- **Promise.any()**: First to fulfill wins`,
    codeExample: `// Creating a Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("Data loaded!");
    } else {
      reject(new Error("Failed!"));
    }
  }, 1000);
});

// Using the Promise
promise
  .then(data => {
    console.log(data);
    return "Processed: " + data;
  })
  .then(processed => console.log(processed))
  .catch(error => console.error(error))
  .finally(() => console.log("Done!"));

// Promise.all - wait for all
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => console.log(r1, r2, r3));

// Promise.race - first wins
Promise.race([
  new Promise(r => setTimeout(() => r("slow"), 200)),
  new Promise(r => setTimeout(() => r("fast"), 100))
]).then(console.log); // "fast"

// Promise.allSettled - all results
Promise.allSettled([
  Promise.resolve("success"),
  Promise.reject("error")
]).then(console.log);
// [{status:"fulfilled",value:"success"},
//  {status:"rejected",reason:"error"}]`,
    interviewQuestions: [
      'What are the three states of a Promise?',
      'What is the difference between Promise.all and Promise.allSettled?',
      'How does Promise chaining work?',
      'Can a Promise change state more than once?',
    ],
  },
  {
    id: 'async-await',
    category: 'async',
    title: 'Async/Await',
    description: 'Syntactic sugar for Promises',
    icon: 'Pause',
    subTopics: [
      { id: 'async-functions', title: 'async Functions', description: 'Functions that return Promises' },
      { id: 'await-keyword', title: 'await Keyword', description: 'Pause until Promise settles' },
      { id: 'error-handling', title: 'Error Handling', description: 'try/catch with async' },
    ],
    explanation: `## Async/Await

Async/await is syntactic sugar over Promises, making async code look synchronous.

### async Function
- Always returns a Promise
- Allows use of await inside
- Can be used with function declarations, expressions, and arrows

### await Keyword
- Pauses execution until Promise settles
- Returns the resolved value
- Can only be used inside async functions (or at top level in modules)

### Error Handling
- Use try/catch blocks
- Unhandled rejections propagate up`,
    codeExample: `// async function
async function fetchUser() {
  return { name: "John" }; // Wrapped in Promise
}

// await keyword
async function getData() {
  const user = await fetchUser();
  console.log(user.name);
  return user;
}

// Error handling
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed:", error);
    throw error; // Re-throw if needed
  }
}

// Parallel execution
async function loadAll() {
  // Sequential (slower)
  const user = await fetchUser();
  const posts = await fetchPosts();

  // Parallel (faster!)
  const [user2, posts2] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
}

// async arrow function
const getUser = async () => {
  const response = await fetch("/api/user");
  return response.json();
};

// Top-level await (in modules)
const data = await fetch("/api").then(r => r.json());`,
    interviewQuestions: [
      'What does async/await return?',
      'How do you handle errors with async/await?',
      'How do you run async operations in parallel?',
      'Can you use await outside an async function?',
    ],
  },

  // DOM & WEB APIS
  {
    id: 'dom-manipulation',
    category: 'dom-web-apis',
    title: 'DOM Manipulation',
    description: 'Selecting and modifying DOM elements',
    icon: 'Layout',
    subTopics: [
      { id: 'selectors', title: 'Selectors', description: 'querySelector, getElementById' },
      { id: 'modification', title: 'Modification', description: 'innerHTML, textContent, attributes' },
      { id: 'creation', title: 'Creation', description: 'createElement, appendChild' },
    ],
    explanation: `## DOM Manipulation

The Document Object Model (DOM) represents HTML as a tree of nodes that can be manipulated with JavaScript.

### Selecting Elements
- document.getElementById()
- document.querySelector() / querySelectorAll()
- document.getElementsByClassName()
- document.getElementsByTagName()

### Modifying Elements
- element.innerHTML / textContent
- element.setAttribute() / getAttribute()
- element.classList.add/remove/toggle
- element.style.property`,
    codeExample: `// Selecting elements
const el = document.getElementById("myId");
const el2 = document.querySelector(".myClass");
const all = document.querySelectorAll("p");

// Modifying content
el.textContent = "Plain text";
el.innerHTML = "<strong>HTML</strong>";

// Attributes
el.setAttribute("data-id", "123");
el.getAttribute("data-id"); // "123"
el.removeAttribute("data-id");

// Classes
el.classList.add("active");
el.classList.remove("active");
el.classList.toggle("active");
el.classList.contains("active");

// Styles
el.style.color = "red";
el.style.backgroundColor = "blue";

// Creating elements
const div = document.createElement("div");
div.textContent = "New element";
document.body.appendChild(div);

// Removing elements
el.remove();
// or parent.removeChild(el);

// Cloning
const clone = el.cloneNode(true); // deep clone`,
    interviewQuestions: [
      'What is the difference between innerHTML and textContent?',
      'How do you efficiently add multiple elements to the DOM?',
      'What is event delegation?',
      'Explain the difference between querySelector and getElementById',
    ],
  },
  {
    id: 'event-handling',
    category: 'dom-web-apis',
    title: 'Event Handling',
    description: 'Bubbling, capturing, delegation',
    icon: 'MousePointer',
    subTopics: [
      { id: 'event-bubbling', title: 'Event Bubbling', description: 'Events propagate up the DOM' },
      { id: 'event-capturing', title: 'Event Capturing', description: 'Events propagate down' },
      { id: 'delegation', title: 'Event Delegation', description: 'Handle events on parent' },
    ],
    explanation: `## Event Handling

### Event Propagation
1. **Capturing Phase**: Event travels DOWN from window to target
2. **Target Phase**: Event reaches the target element
3. **Bubbling Phase**: Event travels UP from target to window

### Event Delegation
Attach event listener to parent, handle events from children using event.target. More efficient for dynamic content.

### Common Methods
- addEventListener(type, handler, options)
- removeEventListener(type, handler)
- event.preventDefault()
- event.stopPropagation()`,
    codeExample: `// Basic event listener
const button = document.querySelector("button");
button.addEventListener("click", (event) => {
  console.log("Clicked!", event.target);
});

// Event bubbling (default)
document.body.addEventListener("click", () => {
  console.log("Body clicked (bubbling)");
});

// Event capturing
document.body.addEventListener("click", () => {
  console.log("Body clicked (capturing)");
}, { capture: true });

// Stop propagation
button.addEventListener("click", (e) => {
  e.stopPropagation(); // Stop bubbling
});

// Prevent default
const link = document.querySelector("a");
link.addEventListener("click", (e) => {
  e.preventDefault(); // Don't navigate
});

// Event delegation
const list = document.querySelector("ul");
list.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("List item clicked:", e.target);
  }
});

// Once option - auto remove after first call
button.addEventListener("click", handler, { once: true });

// Remove listener
const handler = () => console.log("click");
button.addEventListener("click", handler);
button.removeEventListener("click", handler);`,
    interviewQuestions: [
      'What is event bubbling and capturing?',
      'Explain event delegation with an example',
      'What is the difference between stopPropagation and preventDefault?',
      'How do you remove an event listener?',
    ],
  },

  // OOP
  {
    id: 'this-keyword',
    category: 'oop',
    title: 'this Keyword',
    description: 'Understanding this binding',
    icon: 'Target',
    subTopics: [
      { id: 'implicit', title: 'Implicit Binding', description: 'Object method calls' },
      { id: 'explicit', title: 'Explicit Binding', description: 'call, apply, bind' },
      { id: 'arrow-this', title: 'Arrow Functions', description: 'Lexical this binding' },
    ],
    explanation: `## The this Keyword

The value of \`this\` depends on HOW a function is called, not where it's defined.

### Binding Rules (in order of precedence)
1. **new binding**: this = new object
2. **explicit binding**: call/apply/bind set this
3. **implicit binding**: this = object calling method
4. **default binding**: this = global (or undefined in strict mode)

### Arrow Functions
Arrow functions don't have their own this - they inherit from parent scope (lexical this).`,
    codeExample: `// Implicit binding - object method
const obj = {
  name: "Object",
  greet() {
    console.log(this.name); // "Object"
  }
};
obj.greet();

// Lost binding
const greet = obj.greet;
greet(); // undefined (or error in strict)

// Explicit binding - call/apply/bind
function sayName() {
  console.log(this.name);
}

const person = { name: "John" };
sayName.call(person);    // "John"
sayName.apply(person);   // "John"

// call vs apply (arguments)
function add(a, b) {
  return this.value + a + b;
}
const ctx = { value: 10 };
add.call(ctx, 1, 2);     // 13
add.apply(ctx, [1, 2]);  // 13

// bind - returns new function
const boundSayName = sayName.bind(person);
boundSayName(); // "John"

// Arrow functions - lexical this
const obj2 = {
  name: "Object",
  regular: function() {
    setTimeout(function() {
      console.log(this.name); // undefined!
    }, 100);
  },
  arrow: function() {
    setTimeout(() => {
      console.log(this.name); // "Object"
    }, 100);
  }
};

// new binding
function Person(name) {
  this.name = name;
}
const p = new Person("John");
console.log(p.name); // "John"`,
    interviewQuestions: [
      'What are the rules for this binding?',
      'What is the difference between call, apply, and bind?',
      'Why do arrow functions not have their own this?',
      'How does this behave in strict mode?',
    ],
  },
  {
    id: 'prototypes',
    category: 'oop',
    title: 'Prototypes',
    description: 'Prototype chain and inheritance',
    icon: 'GitCommitHorizontal',
    subTopics: [
      { id: 'prototype-chain', title: 'Prototype Chain', description: 'How objects inherit' },
      { id: 'proto-property', title: '__proto__ vs prototype', description: 'Understanding the difference' },
      { id: 'object-create', title: 'Object.create', description: 'Creating objects with prototype' },
    ],
    explanation: `## Prototypes

JavaScript uses prototypal inheritance. Every object has an internal [[Prototype]] link to another object.

### Key Concepts
- **prototype**: Property on constructor functions
- **__proto__**: Reference to object's prototype (deprecated, use Object.getPrototypeOf)
- **Prototype Chain**: Objects inherit from their prototype, which inherits from its prototype, etc.

### Lookup Process
1. Check own properties
2. Check prototype
3. Continue up chain until null`,
    codeExample: `// Constructor function with prototype
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(this.name + " makes a sound");
};

const dog = new Animal("Rex");
dog.speak(); // "Rex makes a sound"

// Prototype chain
console.log(dog.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null (end of chain)

// Check property location
dog.hasOwnProperty("name");  // true (own)
dog.hasOwnProperty("speak"); // false (on prototype)

// Object.create
const animalProto = {
  speak() {
    console.log(this.name + " speaks");
  }
};

const cat = Object.create(animalProto);
cat.name = "Whiskers";
cat.speak(); // "Whiskers speaks"

// Inheritance with prototypes
function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(this.name + " barks!");
};

const buddy = new Dog("Buddy", "Labrador");
buddy.speak(); // "Buddy makes a sound" (inherited)
buddy.bark();  // "Buddy barks!"`,
    interviewQuestions: [
      'What is the prototype chain?',
      'What is the difference between __proto__ and prototype?',
      'How does JavaScript look up properties?',
      'How do you implement inheritance with prototypes?',
    ],
  },
  {
    id: 'classes',
    category: 'oop',
    title: 'ES6 Classes',
    description: 'Modern class syntax',
    icon: 'Box',
    subTopics: [
      { id: 'class-syntax', title: 'Class Syntax', description: 'constructor, methods, properties' },
      { id: 'inheritance', title: 'Inheritance', description: 'extends, super' },
      { id: 'static', title: 'Static Members', description: 'Class-level properties and methods' },
    ],
    explanation: `## ES6 Classes

Classes are syntactic sugar over JavaScript's prototype-based inheritance.

### Features
- constructor method for initialization
- Instance methods and properties
- Static methods and properties
- Getters and setters
- extends for inheritance
- super to call parent methods

### Private Fields (ES2022)
- Use # prefix for truly private members`,
    codeExample: `// Class definition
class Animal {
  // Private field
  #id = Math.random();
  
  // Public field
  species = "unknown";
  
  constructor(name) {
    this.name = name;
  }
  
  // Instance method
  speak() {
    console.log(this.name + " makes a sound");
  }
  
  // Getter
  get info() {
    return \`\${this.name} (\${this.species})\`;
  }
  
  // Setter
  set nickname(value) {
    this.name = value;
  }
  
  // Static method
  static create(name) {
    return new Animal(name);
  }
  
  // Static property
  static kingdom = "Animalia";
}

// Usage
const animal = new Animal("Buddy");
animal.speak();
console.log(animal.info);
console.log(Animal.kingdom);

// Inheritance
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
    this.species = "Canis familiaris";
  }
  
  speak() {
    super.speak(); // Call parent method
    console.log(this.name + " barks!");
  }
  
  fetch() {
    console.log(this.name + " fetches the ball");
  }
}

const dog = new Dog("Rex", "German Shepherd");
dog.speak();
// "Rex makes a sound"
// "Rex barks!"`,
    interviewQuestions: [
      'Are classes in JavaScript true classes?',
      'What is the purpose of super()?',
      'How do you create private properties in classes?',
      'What is the difference between static and instance methods?',
    ],
  },

  // PROFESSIONAL TOPICS
  {
    id: 'modules',
    category: 'professional',
    title: 'ES6 Modules',
    description: 'Import/export syntax',
    icon: 'Package',
    subTopics: [
      { id: 'named-exports', title: 'Named Exports', description: 'export { name }' },
      { id: 'default-exports', title: 'Default Export', description: 'export default' },
      { id: 'dynamic-imports', title: 'Dynamic Imports', description: 'import()' },
    ],
    explanation: `## ES6 Modules

Modules allow you to split code into separate files with their own scope.

### Named Exports
- Export multiple values
- Import by exact name (or rename with as)
- Use curly braces when importing

### Default Export
- One per module
- Import with any name
- No curly braces needed

### Dynamic Imports
- Load modules on demand
- Returns a Promise
- Great for code splitting`,
    codeExample: `// utils.js - Named exports
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export class Calculator { }

// math.js - Default export
export default function multiply(a, b) {
  return a * b;
}

// main.js - Importing
import multiply from "./math.js"; // default
import { PI, add } from "./utils.js"; // named
import { add as addition } from "./utils.js"; // rename
import * as utils from "./utils.js"; // all as namespace

// Re-exporting
export { add, PI } from "./utils.js";
export { default as multiply } from "./math.js";

// Dynamic import
async function loadModule() {
  const module = await import("./heavy-module.js");
  module.doSomething();
}

// Conditional loading
if (condition) {
  import("./optional.js").then(mod => {
    mod.init();
  });
}`,
    interviewQuestions: [
      'What is the difference between named and default exports?',
      'Can you have multiple default exports?',
      'What are the benefits of ES6 modules over CommonJS?',
      'How do dynamic imports help with performance?',
    ],
  },
  {
    id: 'error-handling',
    category: 'professional',
    title: 'Error Handling',
    description: 'try/catch, custom errors',
    icon: 'AlertTriangle',
    subTopics: [
      { id: 'try-catch', title: 'try/catch/finally', description: 'Handling exceptions' },
      { id: 'error-types', title: 'Error Types', description: 'Built-in error classes' },
      { id: 'custom-errors', title: 'Custom Errors', description: 'Creating error classes' },
    ],
    explanation: `## Error Handling

### try/catch/finally
- try: Code that might throw
- catch: Handle the error
- finally: Always runs (cleanup)

### Built-in Error Types
- Error: Base error class
- SyntaxError: Invalid syntax
- ReferenceError: Invalid reference
- TypeError: Wrong type operation
- RangeError: Value out of range

### Best Practices
- Catch specific errors when possible
- Don't swallow errors silently
- Add context to errors
- Use custom errors for domain logic`,
    codeExample: `// Basic try/catch
try {
  throw new Error("Something went wrong!");
} catch (error) {
  console.error(error.message);
} finally {
  console.log("Cleanup");
}

// Catching specific errors
try {
  JSON.parse("invalid json");
} catch (error) {
  if (error instanceof SyntaxError) {
    console.log("Invalid JSON");
  } else {
    throw error; // Re-throw unknown errors
  }
}

// Custom error class
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function validateUser(user) {
  if (!user.email) {
    throw new ValidationError(
      "Email is required",
      "email"
    );
  }
}

try {
  validateUser({});
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(\`\${error.field}: \${error.message}\`);
  }
}

// Async error handling
async function fetchData() {
  try {
    const response = await fetch("/api");
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}`,
    interviewQuestions: [
      'When does the finally block execute?',
      'How do you create a custom error class?',
      'What is the difference between throw and reject?',
      'How do you handle errors in async/await?',
    ],
  },
  {
    id: 'strict-mode',
    category: 'professional',
    title: 'Strict Mode',
    description: 'Opt-in to stricter parsing',
    icon: 'Shield',
    subTopics: [
      { id: 'enabling', title: 'Enabling Strict Mode', description: '"use strict" directive' },
      { id: 'restrictions', title: 'Restrictions', description: 'What changes in strict mode' },
      { id: 'benefits', title: 'Benefits', description: 'Why use strict mode' },
    ],
    explanation: `## Strict Mode

Strict mode is a way to opt into a restricted variant of JavaScript that catches common mistakes.

### Enabling
- Add "use strict"; at start of file or function
- ES6 modules are strict by default
- Classes are strict by default

### Key Changes
- No implicit globals
- No duplicate parameters
- this is undefined (not global) in functions
- No with statement
- No octal literals
- Cannot delete variables`,
    codeExample: `"use strict";

// Error: Assignment to undeclared variable
// x = 10; // ReferenceError!
let x = 10; // OK

// Error: Duplicate parameters
// function add(a, a) {} // SyntaxError!

// this is undefined in functions
function showThis() {
  console.log(this); // undefined (not window)
}

// Cannot delete variables
let y = 5;
// delete y; // SyntaxError!

// Cannot delete functions
function fn() {}
// delete fn; // SyntaxError!

// Reserved words cannot be used
// let implements = 1; // SyntaxError!
// let interface = 1;  // SyntaxError!

// No with statement
// with (obj) {} // SyntaxError!

// No octal syntax
// let num = 010; // SyntaxError!
let num = 0o10; // OK, ES6 octal

// Function-level strict mode
function loose() {
  // not strict
}

function strict() {
  "use strict";
  // strict mode
}`,
    interviewQuestions: [
      'What does strict mode do?',
      'How do you enable strict mode?',
      'What are the main differences in strict mode?',
      'Are ES6 modules strict by default?',
    ],
  },
  {
    id: 'json',
    category: 'professional',
    title: 'JSON',
    description: 'Working with JSON data',
    icon: 'FileJson',
    subTopics: [
      { id: 'parse-stringify', title: 'parse/stringify', description: 'Converting to/from JSON' },
      { id: 'reviver-replacer', title: 'Reviver/Replacer', description: 'Transform during conversion' },
      { id: 'limitations', title: 'Limitations', description: 'What JSON cannot represent' },
    ],
    explanation: `## JSON (JavaScript Object Notation)

JSON is a text format for storing and transporting data.

### Methods
- JSON.parse(): String → Object
- JSON.stringify(): Object → String

### Valid JSON Types
- Strings (double quotes only)
- Numbers
- Booleans
- null
- Arrays
- Objects

### Not Supported
- undefined
- Functions
- Symbols
- Dates (converted to strings)
- Circular references`,
    codeExample: `// Parse JSON string to object
const jsonStr = '{"name":"John","age":30}';
const obj = JSON.parse(jsonStr);
console.log(obj.name); // "John"

// Stringify object to JSON
const data = { name: "John", age: 30 };
const json = JSON.stringify(data);
console.log(json); // '{"name":"John","age":30}'

// Pretty print
const pretty = JSON.stringify(data, null, 2);
/*
{
  "name": "John",
  "age": 30
}
*/

// Reviver function (during parse)
const dateStr = '{"date":"2024-01-01"}';
const parsed = JSON.parse(dateStr, (key, value) => {
  if (key === "date") return new Date(value);
  return value;
});

// Replacer function (during stringify)
const user = { name: "John", password: "secret" };
const safe = JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined;
  return value;
});
// '{"name":"John"}'

// Replacer array (include only these keys)
JSON.stringify(user, ["name"]);
// '{"name":"John"}'

// Handle special values
const special = {
  fn: function() {},
  undef: undefined,
  date: new Date()
};
JSON.stringify(special);
// '{"date":"2024-01-01T..."}'
// fn and undef are omitted!`,
    interviewQuestions: [
      'What types cannot be represented in JSON?',
      'How do you handle Dates in JSON?',
      'What is the purpose of the reviver function?',
      'How do you exclude properties when stringifying?',
    ],
  },
]
