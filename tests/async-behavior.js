// ========================================
// TEST 8: Promise Microtask Queue
// Expected output order:
// "sync"
// "microtask"
// ========================================
Promise.resolve().then(function onFulfilled() {
  console.log("microtask")
})
console.log("sync")


// ========================================
// TEST 9: Async/Await (Commented - needs parser support)
// Uncomment when async/await syntax is added
// ========================================
/*
async function test() {
  console.log("start")
  await Promise.resolve()
  console.log("after await")
}

test()
// Expected: "start", "after await"
*/


// ========================================
// TEST 10: Event Loop Order
// Expected output order:
// "end"
// "promise"
// "timeout"
// ========================================
setTimeout(function timeout() {
  console.log("timeout")
}, 0)

Promise.resolve().then(function onFulfilled() {
  console.log("promise")
})

console.log("end")


// ========================================
// BONUS TEST: Multiple Promises Chain
// Expected: 1, 2, 3 (in order)
// ========================================
Promise.resolve(1)
  .then(function onFulfilled1(val) {
   console.log(val)
    return val +1
  })
  .then(function onFulfilled2(val) {
   console.log(val)
    return val +1
  })
  .then(function onFulfilled3(val) {
   console.log(val)
  })


// ========================================
// BONUS TEST: Mixed setTimeout and Promises
// Expected: "sync", "p1", "p2", "t1", "t2"
// ========================================
console.log("sync")

Promise.resolve().then(function p1() {
  console.log("p1")
})

setTimeout(function t1() {
  console.log("t1")
}, 0)

Promise.resolve().then(function p2() {
  console.log("p2")
})

setTimeout(function t2() {
  console.log("t2")
}, 0)
