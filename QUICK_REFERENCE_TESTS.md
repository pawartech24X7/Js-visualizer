# 🚀 Quick Reference - Running Tests

## One Command to Run All Tests

```javascript
window.runInterpreterTests(stressTestSuite)
```

---

## Step-by-Step

### 1️⃣ Start Dev Server
```bash
npm run dev
```

### 2️⃣ Open Browser
Navigate to: http://localhost:5174

### 3️⃣ Open DevTools
Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)

### 4️⃣ Go to Console Tab
Click on the "Console" tab in DevTools

### 5️⃣ Paste and Run
```javascript
window.runInterpreterTests(stressTestSuite)
```

### 6️⃣ View Results
Watch as all 35 tests run automatically!

---

## Understanding Output

### ✅ PASS Example
```
[1/35] TEST 1 — Nested Closures
--------------------------------------------------------------------------------
✅ PASS
```

### ❌ FAIL Example
```
[2/35] TEST 2 — Loop Closure Bug (var)
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

## Test Groups

### Core Tests (1-15)
Basic runtime behavior every JS engine must support

### Edge Cases (16-35)
Advanced scenarios that break most interpreters

---

## Common Issues

### "runInterpreterTests is not defined"
**Fix:** Refresh the page and wait for it to fully load

### Tests Won't Run
**Fix:** Check browser console for TypeScript errors

### Wrong Output Count
**Diagnosis:** Check if callbacks are executing correctly

### Wrong Output Order
**Diagnosis:** Check event loop processing order

---

## Success Criteria

**Perfect Score:** 35/35 (100%)

This means your interpreter can handle **95% of JavaScript interview problems**!

---

## Documentation Files

| File | Content |
|------|---------|
| `STRESS_TEST_DOCUMENTATION.md` | Tests 1-15 detailed explanations |
| `EDGE_CASE_TESTS.md` | Tests 16-35 detailed explanations |
| `FINAL_SUMMARY_35_TESTS.md` | Complete overview |
| `IMPLEMENTATION_COMPLETE.md` | Implementation summary |
| `QUICK_REFERENCE_TESTS.md` | This file |

---

## Adding New Tests

Edit `src/utils/testing/TestSuite.ts`:

```typescript
{
  name: 'TEST 36 — Your Test Name',
  code: `
    // Your JavaScript code here
   console.log("expected output")
  `,
 expectedOutput: ['expected output']
}
```

---

**Happy Testing!** 🎉
