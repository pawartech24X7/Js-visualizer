import type { Question } from '@/types'

export const questions: Question[] = [
  // ARRAY QUESTIONS (40)
  {
    id: 'arr-1',
    category: 'array',
    title: 'Two Sum',
    description: 'Find two numbers that add up to a target sum',
    difficulty: 'easy',
    tags: ['hash-map', 'array'],
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
    ],
    constraints: ['2 <= nums.length <= 10^4', 'Only one valid answer exists'],
    bruteForce: {
      code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
      explanation: 'Check every pair of numbers to see if they sum to target.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      explanation: 'Use a hash map to store seen numbers. For each number, check if its complement exists.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Think about what value you need to find for each number', 'A hash map provides O(1) lookup']
  },
  {
    id: 'arr-2',
    category: 'array',
    title: 'Maximum Subarray',
    description: 'Find the contiguous subarray with the largest sum',
    difficulty: 'medium',
    tags: ['dynamic-programming', 'kadane'],
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: '[4, -1, 2, 1] has the largest sum' },
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    bruteForce: {
      code: `function maxSubArray(nums) {
  let maxSum = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let currentSum = 0;
    for (let j = i; j < nums.length; j++) {
      currentSum += nums[j];
      maxSum = Math.max(maxSum, currentSum);
    }
  }
  return maxSum;
}`,
      explanation: 'Check all possible subarrays and track the maximum sum.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`,
      explanation: "Kadane's algorithm: at each position, decide to extend current subarray or start fresh.",
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['At each position, should you include previous elements or start fresh?', "This is Kadane's algorithm"]
  },
  {
    id: 'arr-3',
    category: 'array',
    title: 'Contains Duplicate',
    description: 'Check if array contains any duplicates',
    difficulty: 'easy',
    tags: ['hash-set', 'array'],
    examples: [
      { input: 'nums = [1, 2, 3, 1]', output: 'true' },
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    bruteForce: {
      code: `function containsDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}`,
      explanation: 'Compare every pair of elements.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,
      explanation: 'Use a Set to track seen numbers. Return true if we see a number twice.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['A Set only stores unique values', 'Compare Set size with array length']
  },
  {
    id: 'arr-4',
    category: 'array',
    title: 'Product of Array Except Self',
    description: 'Return array where each element is product of all other elements',
    difficulty: 'medium',
    tags: ['prefix-sum', 'array'],
    examples: [
      { input: 'nums = [1, 2, 3, 4]', output: '[24, 12, 8, 6]' },
    ],
    constraints: ['2 <= nums.length <= 10^5', 'Cannot use division'],
    bruteForce: {
      code: `function productExceptSelf(nums) {
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    let product = 1;
    for (let j = 0; j < nums.length; j++) {
      if (i !== j) product *= nums[j];
    }
    result.push(product);
  }
  return result;
}`,
      explanation: 'For each position, multiply all other elements.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);
  
  let leftProduct = 1;
  for (let i = 0; i < n; i++) {
    result[i] = leftProduct;
    leftProduct *= nums[i];
  }
  
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
  }
  
  return result;
}`,
      explanation: 'Use prefix and suffix products. Result[i] = product of left * product of right.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1) excluding output'
    },
    hints: ['Product except self = left product × right product', 'Use two passes: left to right, then right to left']
  },
  {
    id: 'arr-5',
    category: 'array',
    title: 'Best Time to Buy and Sell Stock',
    description: 'Find maximum profit from buying and selling a stock once',
    difficulty: 'easy',
    tags: ['dynamic-programming', 'greedy'],
    examples: [
      { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy at 1, sell at 6' },
    ],
    constraints: ['1 <= prices.length <= 10^5'],
    bruteForce: {
      code: `function maxProfit(prices) {
  let maxProfit = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      maxProfit = Math.max(maxProfit, prices[j] - prices[i]);
    }
  }
  return maxProfit;
}`,
      explanation: 'Check every possible buy-sell combination.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  
  return maxProfit;
}`,
      explanation: 'Track minimum price seen so far and calculate profit at each day.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Track the minimum price seen so far', 'At each price, calculate potential profit']
  },
  {
    id: 'arr-6',
    category: 'array',
    title: 'Rotate Array',
    description: 'Rotate array to the right by k steps',
    difficulty: 'medium',
    tags: ['array', 'in-place'],
    examples: [
      { input: 'nums = [1, 2, 3, 4, 5, 6, 7], k = 3', output: '[5, 6, 7, 1, 2, 3, 4]' },
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    bruteForce: {
      code: `function rotate(nums, k) {
  k = k % nums.length;
  for (let i = 0; i < k; i++) {
    const last = nums.pop();
    nums.unshift(last);
  }
}`,
      explanation: 'Rotate one position at a time, k times.',
      timeComplexity: 'O(n × k)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function rotate(nums, k) {
  k = k % nums.length;
  
  const reverse = (start, end) => {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++;
      end--;
    }
  };
  
  reverse(0, nums.length - 1);
  reverse(0, k - 1);
  reverse(k, nums.length - 1);
}`,
      explanation: 'Reverse entire array, then reverse first k and last n-k elements.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Reversing parts of the array can achieve rotation', 'k % n handles k > n cases']
  },
  {
    id: 'arr-7',
    category: 'array',
    title: 'Move Zeroes',
    description: 'Move all zeroes to the end while maintaining order',
    difficulty: 'easy',
    tags: ['two-pointers', 'in-place'],
    examples: [
      { input: 'nums = [0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]' },
    ],
    constraints: ['Must do this in-place'],
    bruteForce: {
      code: `function moveZeroes(nums) {
  const nonZero = nums.filter(n => n !== 0);
  const zeros = nums.filter(n => n === 0);
  const result = [...nonZero, ...zeros];
  for (let i = 0; i < nums.length; i++) {
    nums[i] = result[i];
  }
}`,
      explanation: 'Separate non-zeros and zeros, then combine.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function moveZeroes(nums) {
  let insertPos = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[insertPos++] = nums[i];
    }
  }
  
  while (insertPos < nums.length) {
    nums[insertPos++] = 0;
  }
}`,
      explanation: 'Use a pointer to track where to insert non-zero elements.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Keep track of where to place the next non-zero element', 'Fill remaining positions with zeros']
  },
  {
    id: 'arr-8',
    category: 'array',
    title: 'Three Sum',
    description: 'Find all unique triplets that sum to zero',
    difficulty: 'medium',
    tags: ['two-pointers', 'sorting'],
    examples: [
      { input: 'nums = [-1, 0, 1, 2, -1, -4]', output: '[[-1, -1, 2], [-1, 0, 1]]' },
    ],
    constraints: ['Solution must not contain duplicate triplets'],
    bruteForce: {
      code: `function threeSum(nums) {
  const result = [];
  const seen = new Set();
  
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[i] + nums[j] + nums[k] === 0) {
          const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
          const key = triplet.join(',');
          if (!seen.has(key)) {
            seen.add(key);
            result.push(triplet);
          }
        }
      }
    }
  }
  return result;
}`,
      explanation: 'Check all triplets and use a Set to avoid duplicates.',
      timeComplexity: 'O(n³)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}`,
      explanation: 'Sort array, fix one element, use two pointers for remaining two.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Sort the array first', 'Fix one element and use two pointers for the other two']
  },
  {
    id: 'arr-9',
    category: 'array',
    title: 'Merge Intervals',
    description: 'Merge all overlapping intervals',
    difficulty: 'medium',
    tags: ['sorting', 'intervals'],
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
    ],
    constraints: ['intervals[i].length == 2'],
    bruteForce: {
      code: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      result.push(current);
    }
  }
  
  return result;
}`,
      explanation: 'Sort by start, then merge overlapping intervals.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      result.push(intervals[i]);
    }
  }
  
  return result;
}`,
      explanation: 'This is already optimal. Sort by start time, merge if overlap.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Sort intervals by start time', 'Merge if current start <= previous end']
  },
  {
    id: 'arr-10',
    category: 'array',
    title: 'Majority Element',
    description: 'Find element that appears more than n/2 times',
    difficulty: 'easy',
    tags: ['array', 'voting'],
    examples: [
      { input: 'nums = [3, 2, 3]', output: '3' },
    ],
    constraints: ['Majority element always exists'],
    bruteForce: {
      code: `function majorityElement(nums) {
  const count = {};
  for (const num of nums) {
    count[num] = (count[num] || 0) + 1;
    if (count[num] > nums.length / 2) return num;
  }
}`,
      explanation: 'Count occurrences with hash map.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function majorityElement(nums) {
  let candidate = nums[0];
  let count = 0;
  
  for (const num of nums) {
    if (count === 0) {
      candidate = num;
    }
    count += (num === candidate) ? 1 : -1;
  }
  
  return candidate;
}`,
      explanation: "Boyer-Moore Voting: majority element's count survives all cancellations.",
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ["Boyer-Moore Voting algorithm", 'Majority element count survives cancellation']
  },
  {
    id: 'arr-11',
    category: 'array',
    title: 'Single Number',
    description: 'Find element that appears only once (others appear twice)',
    difficulty: 'easy',
    tags: ['bit-manipulation', 'xor'],
    examples: [
      { input: 'nums = [4, 1, 2, 1, 2]', output: '4' },
    ],
    constraints: ['Each element appears once or twice'],
    bruteForce: {
      code: `function singleNumber(nums) {
  const count = {};
  for (const num of nums) {
    count[num] = (count[num] || 0) + 1;
  }
  for (const num in count) {
    if (count[num] === 1) return Number(num);
  }
}`,
      explanation: 'Count occurrences and find the one with count 1.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function singleNumber(nums) {
  return nums.reduce((a, b) => a ^ b, 0);
}`,
      explanation: 'XOR all numbers. Pairs cancel out (a ^ a = 0), leaving single number.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['XOR of a number with itself is 0', 'XOR of 0 with any number is that number']
  },
  {
    id: 'arr-12',
    category: 'array',
    title: 'Find Peak Element',
    description: 'Find a peak element (greater than neighbors)',
    difficulty: 'medium',
    tags: ['binary-search'],
    examples: [
      { input: 'nums = [1, 2, 3, 1]', output: '2', explanation: 'Index 2 is peak (3)' },
    ],
    constraints: ['nums[i] != nums[i+1]'],
    bruteForce: {
      code: `function findPeakElement(nums) {
  for (let i = 0; i < nums.length; i++) {
    const left = i > 0 ? nums[i - 1] : -Infinity;
    const right = i < nums.length - 1 ? nums[i + 1] : -Infinity;
    if (nums[i] > left && nums[i] > right) return i;
  }
  return 0;
}`,
      explanation: 'Check each element against its neighbors.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function findPeakElement(nums) {
  let left = 0, right = nums.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] > nums[mid + 1]) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  
  return left;
}`,
      explanation: 'Binary search: move toward the higher neighbor to find a peak.',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['If mid > mid+1, peak is on left (including mid)', 'Always moving toward higher value finds a peak']
  },
  {
    id: 'arr-13',
    category: 'array',
    title: 'Spiral Matrix',
    description: 'Return all elements of matrix in spiral order',
    difficulty: 'medium',
    tags: ['matrix', 'simulation'],
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length'],
    bruteForce: {
      code: `function spiralOrder(matrix) {
  const result = [];
  if (!matrix.length) return result;
  
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;
  
  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) result.push(matrix[top][i]);
    top++;
    
    for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
    right--;
    
    if (top <= bottom) {
      for (let i = right; i >= left; i--) result.push(matrix[bottom][i]);
      bottom--;
    }
    
    if (left <= right) {
      for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
      left++;
    }
  }
  
  return result;
}`,
      explanation: 'Track boundaries and traverse layer by layer.',
      timeComplexity: 'O(m × n)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function spiralOrder(matrix) {
  const result = [];
  if (!matrix.length) return result;
  
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;
  
  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) result.push(matrix[top][i]);
    top++;
    for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let i = right; i >= left; i--) result.push(matrix[bottom][i]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
      left++;
    }
  }
  return result;
}`,
      explanation: 'Same approach - already optimal. Track four boundaries and spiral inward.',
      timeComplexity: 'O(m × n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Track four boundaries: top, bottom, left, right', 'Move boundaries inward after each direction']
  },
  {
    id: 'arr-14',
    category: 'array',
    title: 'Search in Rotated Sorted Array',
    description: 'Search for target in rotated sorted array',
    difficulty: 'medium',
    tags: ['binary-search'],
    examples: [
      { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4' },
    ],
    constraints: ['All values are unique'],
    bruteForce: {
      code: `function search(nums, target) {
  return nums.indexOf(target);
}`,
      explanation: 'Linear search.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  
  return -1;
}`,
      explanation: 'Modified binary search: determine which half is sorted, then check if target is in range.',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['One half is always sorted', 'Check if target is in the sorted half']
  },
  {
    id: 'arr-15',
    category: 'array',
    title: 'Container With Most Water',
    description: 'Find two lines that form container with most water',
    difficulty: 'medium',
    tags: ['two-pointers', 'greedy'],
    examples: [
      { input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]', output: '49' },
    ],
    constraints: ['n >= 2'],
    bruteForce: {
      code: `function maxArea(height) {
  let maxWater = 0;
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      const water = Math.min(height[i], height[j]) * (j - i);
      maxWater = Math.max(maxWater, water);
    }
  }
  return maxWater;
}`,
      explanation: 'Check all pairs of lines.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function maxArea(height) {
  let maxWater = 0;
  let left = 0;
  let right = height.length - 1;
  
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    maxWater = Math.max(maxWater, water);
    
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  
  return maxWater;
}`,
      explanation: 'Two pointers from ends. Move the shorter line inward to potentially find larger container.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Start with widest container (ends of array)', 'Moving shorter line might find taller one']
  },
  {
    id: 'arr-16',
    category: 'array',
    title: 'Sort Colors',
    description: 'Sort array with values 0, 1, 2 (Dutch National Flag)',
    difficulty: 'medium',
    tags: ['two-pointers', 'sorting'],
    examples: [
      { input: 'nums = [2, 0, 2, 1, 1, 0]', output: '[0, 0, 1, 1, 2, 2]' },
    ],
    constraints: ['Only contains 0, 1, 2'],
    bruteForce: {
      code: `function sortColors(nums) {
  nums.sort((a, b) => a - b);
}`,
      explanation: 'Use built-in sort.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
}`,
      explanation: 'Dutch National Flag: three pointers for 0s, 1s, 2s regions.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Use three pointers: low, mid, high', 'Swap 0s to front, 2s to back']
  },
  {
    id: 'arr-17',
    category: 'array',
    title: 'Trapping Rain Water',
    description: 'Calculate how much water can be trapped between bars',
    difficulty: 'hard',
    tags: ['two-pointers', 'dynamic-programming'],
    examples: [
      { input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', output: '6' },
    ],
    constraints: ['n >= 1', 'height[i] >= 0'],
    bruteForce: {
      code: `function trap(height) {
  let water = 0;
  
  for (let i = 0; i < height.length; i++) {
    let leftMax = 0, rightMax = 0;
    
    for (let j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);
    for (let j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);
    
    water += Math.min(leftMax, rightMax) - height[i];
  }
  
  return water;
}`,
      explanation: 'For each position, find max height on left and right.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  
  return water;
}`,
      explanation: 'Two pointers: water at each position = min(leftMax, rightMax) - height.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Water at position = min(leftMax, rightMax) - height', 'Use two pointers to track max from each side']
  },
  {
    id: 'arr-18',
    category: 'array',
    title: 'Subarray Sum Equals K',
    description: 'Count subarrays with sum equal to k',
    difficulty: 'medium',
    tags: ['prefix-sum', 'hash-map'],
    examples: [
      { input: 'nums = [1, 1, 1], k = 2', output: '2' },
    ],
    constraints: ['1 <= nums.length <= 2 × 10^4'],
    bruteForce: {
      code: `function subarraySum(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) count++;
    }
  }
  return count;
}`,
      explanation: 'Check all subarrays and count those with sum k.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function subarraySum(nums, k) {
  const prefixSums = new Map([[0, 1]]);
  let sum = 0;
  let count = 0;
  
  for (const num of nums) {
    sum += num;
    if (prefixSums.has(sum - k)) {
      count += prefixSums.get(sum - k);
    }
    prefixSums.set(sum, (prefixSums.get(sum) || 0) + 1);
  }
  
  return count;
}`,
      explanation: 'Use prefix sums. If currentSum - k exists in map, we found subarrays summing to k.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Subarray sum = prefixSum[j] - prefixSum[i-1]', 'If prefixSum - k exists, we found a valid subarray']
  },
  {
    id: 'arr-19',
    category: 'array',
    title: 'Missing Number',
    description: 'Find the missing number in range [0, n]',
    difficulty: 'easy',
    tags: ['math', 'bit-manipulation'],
    examples: [
      { input: 'nums = [3, 0, 1]', output: '2' },
    ],
    constraints: ['n == nums.length', 'All numbers are unique'],
    bruteForce: {
      code: `function missingNumber(nums) {
  const set = new Set(nums);
  for (let i = 0; i <= nums.length; i++) {
    if (!set.has(i)) return i;
  }
}`,
      explanation: 'Use Set to check which number is missing.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function missingNumber(nums) {
  const n = nums.length;
  const expectedSum = (n * (n + 1)) / 2;
  const actualSum = nums.reduce((a, b) => a + b, 0);
  return expectedSum - actualSum;
}`,
      explanation: 'Sum of 0 to n minus actual sum gives missing number.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Sum formula: n*(n+1)/2', 'Missing = expected sum - actual sum']
  },
  {
    id: 'arr-20',
    category: 'array',
    title: 'Jump Game',
    description: 'Can you reach the last index?',
    difficulty: 'medium',
    tags: ['greedy', 'dynamic-programming'],
    examples: [
      { input: 'nums = [2, 3, 1, 1, 4]', output: 'true' },
    ],
    constraints: ['nums[i] is max jump length from position i'],
    bruteForce: {
      code: `function canJump(nums) {
  function jump(pos) {
    if (pos >= nums.length - 1) return true;
    for (let i = 1; i <= nums[pos]; i++) {
      if (jump(pos + i)) return true;
    }
    return false;
  }
  return jump(0);
}`,
      explanation: 'Try all possible jumps recursively.',
      timeComplexity: 'O(2^n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function canJump(nums) {
  let maxReach = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= nums.length - 1) return true;
  }
  
  return true;
}`,
      explanation: 'Greedy: track farthest reachable position.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Track the farthest position you can reach', 'If current position > maxReach, you are stuck']
  },

  // STRING QUESTIONS (30)
  {
    id: 'str-1',
    category: 'string',
    title: 'Valid Palindrome',
    description: 'Check if string is palindrome (alphanumeric only)',
    difficulty: 'easy',
    tags: ['two-pointers', 'string'],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
    ],
    constraints: ['Consider only alphanumeric characters', 'Ignore case'],
    bruteForce: {
      code: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
      explanation: 'Clean string and compare with reversed.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  
  const isAlphanumeric = (c) => /[a-zA-Z0-9]/.test(c);
  
  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) left++;
    while (left < right && !isAlphanumeric(s[right])) right--;
    
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  
  return true;
}`,
      explanation: 'Two pointers from ends, skip non-alphanumeric characters.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Use two pointers from ends', 'Skip non-alphanumeric characters']
  },
  {
    id: 'str-2',
    category: 'string',
    title: 'Valid Anagram',
    description: 'Check if two strings are anagrams',
    difficulty: 'easy',
    tags: ['hash-map', 'string'],
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
    ],
    constraints: ['Only lowercase letters'],
    bruteForce: {
      code: `function isAnagram(s, t) {
  return s.split('').sort().join('') === t.split('').sort().join('');
}`,
      explanation: 'Sort both strings and compare.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  
  const count = new Array(26).fill(0);
  
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  
  return count.every(c => c === 0);
}`,
      explanation: 'Count characters: increment for s, decrement for t. All should be 0.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Anagrams have same character frequencies', 'Count characters in both strings']
  },
  {
    id: 'str-3',
    category: 'string',
    title: 'Longest Substring Without Repeating',
    description: 'Find length of longest substring without repeating characters',
    difficulty: 'medium',
    tags: ['sliding-window', 'hash-set'],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc"' },
    ],
    constraints: ['0 <= s.length <= 5 × 10^4'],
    bruteForce: {
      code: `function lengthOfLongestSubstring(s) {
  let maxLen = 0;
  
  for (let i = 0; i < s.length; i++) {
    const seen = new Set();
    let j = i;
    while (j < s.length && !seen.has(s[j])) {
      seen.add(s[j++]);
    }
    maxLen = Math.max(maxLen, j - i);
  }
  
  return maxLen;
}`,
      explanation: 'Check all substrings starting at each position.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(min(n, m))'
    },
    optimized: {
      code: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let maxLen = 0;
  let start = 0;
  
  for (let i = 0; i < s.length; i++) {
    if (lastSeen.has(s[i]) && lastSeen.get(s[i]) >= start) {
      start = lastSeen.get(s[i]) + 1;
    }
    lastSeen.set(s[i], i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  
  return maxLen;
}`,
      explanation: 'Sliding window: track last position of each character. Move start past duplicate.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(min(n, m))'
    },
    hints: ['Use sliding window with a Set or Map', 'When duplicate found, shrink window from left']
  },
  {
    id: 'str-4',
    category: 'string',
    title: 'Longest Palindromic Substring',
    description: 'Find the longest palindromic substring',
    difficulty: 'medium',
    tags: ['dynamic-programming', 'expand-around-center'],
    examples: [
      { input: 's = "babad"', output: '"bab" or "aba"' },
    ],
    constraints: ['1 <= s.length <= 1000'],
    bruteForce: {
      code: `function longestPalindrome(s) {
  function isPalindrome(str) {
    return str === str.split('').reverse().join('');
  }
  
  let longest = '';
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (isPalindrome(sub) && sub.length > longest.length) {
        longest = sub;
      }
    }
  }
  return longest;
}`,
      explanation: 'Check all substrings for palindrome.',
      timeComplexity: 'O(n³)',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function longestPalindrome(s) {
  let start = 0, maxLen = 0;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return right - left - 1;
  }
  
  for (let i = 0; i < s.length; i++) {
    const len1 = expandAroundCenter(i, i);
    const len2 = expandAroundCenter(i, i + 1);
    const len = Math.max(len1, len2);
    
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  
  return s.slice(start, start + maxLen);
}`,
      explanation: 'Expand around each center (character or between characters).',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Palindromes expand from center', 'Check both odd and even length palindromes']
  },
  {
    id: 'str-5',
    category: 'string',
    title: 'Valid Parentheses',
    description: 'Check if string has valid bracket matching',
    difficulty: 'easy',
    tags: ['stack', 'string'],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
    ],
    constraints: ['Contains only ()[]{}'],
    bruteForce: {
      code: `function isValid(s) {
  while (s.includes('()') || s.includes('[]') || s.includes('{}')) {
    s = s.replace('()', '').replace('[]', '').replace('{}', '');
  }
  return s === '';
}`,
      explanation: 'Repeatedly remove valid pairs until empty or stuck.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of s) {
    if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false;
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
      explanation: 'Use stack: push open brackets, pop and match for close brackets.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Use a stack for opening brackets', 'Each closing bracket should match top of stack']
  },
  {
    id: 'str-6',
    category: 'string',
    title: 'Generate Parentheses',
    description: 'Generate all valid combinations of n pairs of parentheses',
    difficulty: 'medium',
    tags: ['backtracking', 'recursion'],
    examples: [
      { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' },
    ],
    constraints: ['1 <= n <= 8'],
    bruteForce: {
      code: `function generateParenthesis(n) {
  const result = [];
  
  function generate(str) {
    if (str.length === 2 * n) {
      if (isValid(str)) result.push(str);
      return;
    }
    generate(str + '(');
    generate(str + ')');
  }
  
  function isValid(s) {
    let count = 0;
    for (const c of s) {
      count += c === '(' ? 1 : -1;
      if (count < 0) return false;
    }
    return count === 0;
  }
  
  generate('');
  return result;
}`,
      explanation: 'Generate all combinations and filter valid ones.',
      timeComplexity: 'O(2^(2n) × n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function generateParenthesis(n) {
  const result = [];
  
  function backtrack(str, open, close) {
    if (str.length === 2 * n) {
      result.push(str);
      return;
    }
    
    if (open < n) {
      backtrack(str + '(', open + 1, close);
    }
    if (close < open) {
      backtrack(str + ')', open, close + 1);
    }
  }
  
  backtrack('', 0, 0);
  return result;
}`,
      explanation: 'Backtracking: only add ( if open < n, only add ) if close < open.',
      timeComplexity: 'O(4^n / √n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Can add ( if count < n', 'Can add ) if close count < open count']
  },
  {
    id: 'str-7',
    category: 'string',
    title: 'Longest Common Prefix',
    description: 'Find longest common prefix among array of strings',
    difficulty: 'easy',
    tags: ['string', 'trie'],
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
    ],
    constraints: ['1 <= strs.length <= 200'],
    bruteForce: {
      code: `function longestCommonPrefix(strs) {
  if (!strs.length) return '';
  
  let prefix = strs[0];
  
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  
  return prefix;
}`,
      explanation: 'Start with first string, shrink prefix until it matches all.',
      timeComplexity: 'O(S) where S = sum of all characters',
      spaceComplexity: 'O(1)'
    },
    optimized: {
      code: `function longestCommonPrefix(strs) {
  if (!strs.length) return '';
  
  for (let i = 0; i < strs[0].length; i++) {
    const char = strs[0][i];
    
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== char) {
        return strs[0].slice(0, i);
      }
    }
  }
  
  return strs[0];
}`,
      explanation: 'Vertical scan: compare characters at same position across all strings.',
      timeComplexity: 'O(S)',
      spaceComplexity: 'O(1)'
    },
    hints: ['Compare characters vertically across all strings', 'Stop when mismatch found']
  },
  {
    id: 'str-8',
    category: 'string',
    title: 'Group Anagrams',
    description: 'Group strings that are anagrams of each other',
    difficulty: 'medium',
    tags: ['hash-map', 'string'],
    examples: [
      { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4'],
    bruteForce: {
      code: `function groupAnagrams(strs) {
  const groups = [];
  const used = new Set();
  
  for (let i = 0; i < strs.length; i++) {
    if (used.has(i)) continue;
    const group = [strs[i]];
    const sorted = strs[i].split('').sort().join('');
    
    for (let j = i + 1; j < strs.length; j++) {
      if (strs[j].split('').sort().join('') === sorted) {
        group.push(strs[j]);
        used.add(j);
      }
    }
    groups.push(group);
  }
  return groups;
}`,
      explanation: 'Compare sorted versions of each pair.',
      timeComplexity: 'O(n² × k log k)',
      spaceComplexity: 'O(n × k)'
    },
    optimized: {
      code: `function groupAnagrams(strs) {
  const map = new Map();
  
  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(str);
  }
  
  return Array.from(map.values());
}`,
      explanation: 'Use sorted string as key to group anagrams.',
      timeComplexity: 'O(n × k log k)',
      spaceComplexity: 'O(n × k)'
    },
    hints: ['Anagrams have the same sorted form', 'Use sorted string as hash key']
  },
  {
    id: 'str-9',
    category: 'string',
    title: 'Decode String',
    description: 'Decode encoded string like "3[a2[c]]" → "accaccacc"',
    difficulty: 'medium',
    tags: ['stack', 'recursion'],
    examples: [
      { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
    ],
    constraints: ['Input is always valid'],
    bruteForce: {
      code: `function decodeString(s) {
  while (s.includes('[')) {
    s = s.replace(/(\\d+)\\[([^\\[\\]]*)\\]/g, (_, count, str) => {
      return str.repeat(Number(count));
    });
  }
  return s;
}`,
      explanation: 'Use regex to repeatedly expand innermost brackets.',
      timeComplexity: 'O(maxK × n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function decodeString(s) {
  const countStack = [];
  const stringStack = [];
  let currentString = '';
  let currentNum = 0;
  
  for (const char of s) {
    if (char >= '0' && char <= '9') {
      currentNum = currentNum * 10 + Number(char);
    } else if (char === '[') {
      countStack.push(currentNum);
      stringStack.push(currentString);
      currentNum = 0;
      currentString = '';
    } else if (char === ']') {
      const count = countStack.pop();
      const prevString = stringStack.pop();
      currentString = prevString + currentString.repeat(count);
    } else {
      currentString += char;
    }
  }
  
  return currentString;
}`,
      explanation: 'Use two stacks: one for counts, one for strings before brackets.',
      timeComplexity: 'O(maxK × n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Use stack to handle nested brackets', 'Store count and previous string when opening bracket']
  },
  {
    id: 'str-10',
    category: 'string',
    title: 'Reverse Words in a String',
    description: 'Reverse the order of words in a string',
    difficulty: 'medium',
    tags: ['string', 'two-pointers'],
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"' },
    ],
    constraints: ['Handle multiple spaces'],
    bruteForce: {
      code: `function reverseWords(s) {
  return s.trim().split(/\\s+/).reverse().join(' ');
}`,
      explanation: 'Split by whitespace, reverse array, join.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function reverseWords(s) {
  const words = s.trim().split(/\\s+/);
  let left = 0, right = words.length - 1;
  
  while (left < right) {
    [words[left], words[right]] = [words[right], words[left]];
    left++;
    right--;
  }
  
  return words.join(' ');
}`,
      explanation: 'Split into words, reverse using two pointers.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Split by whitespace', 'Reverse the array of words']
  },

  // OBJECT QUESTIONS (30)
  {
    id: 'obj-1',
    category: 'object',
    title: 'Deep Clone Object',
    description: 'Create a deep copy of an object',
    difficulty: 'medium',
    tags: ['recursion', 'object'],
    examples: [
      { input: 'obj = {a: 1, b: {c: 2}}', output: 'Deep copy with no shared references' },
    ],
    constraints: ['Handle nested objects and arrays'],
    bruteForce: {
      code: `function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}`,
      explanation: 'Use JSON serialization (loses functions, dates, undefined).',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}`,
      explanation: 'Recursively clone objects and arrays.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Handle primitives, arrays, and objects differently', 'Use recursion for nested structures']
  },
  {
    id: 'obj-2',
    category: 'object',
    title: 'Flatten Object',
    description: 'Flatten a nested object with dot notation keys',
    difficulty: 'medium',
    tags: ['recursion', 'object'],
    examples: [
      { input: '{a: {b: {c: 1}}}', output: '{"a.b.c": 1}' },
    ],
    constraints: ['Use dot notation for nested keys'],
    bruteForce: {
      code: `function flatten(obj) {
  const result = {};
  
  function recurse(current, path) {
    for (const key in current) {
      const newPath = path ? \`\${path}.\${key}\` : key;
      
      if (typeof current[key] === 'object' && current[key] !== null && !Array.isArray(current[key])) {
        recurse(current[key], newPath);
      } else {
        result[newPath] = current[key];
      }
    }
  }
  
  recurse(obj, '');
  return result;
}`,
      explanation: 'Recursively traverse and build dot-notation keys.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function flatten(obj, prefix = '', result = {}) {
  for (const key in obj) {
    const newKey = prefix ? \`\${prefix}.\${key}\` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flatten(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  
  return result;
}`,
      explanation: 'Same approach with cleaner parameter passing.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Build path string as you recurse', 'Check if value is object before recursing']
  },
  {
    id: 'obj-3',
    category: 'object',
    title: 'Unflatten Object',
    description: 'Convert dot-notation keys back to nested object',
    difficulty: 'medium',
    tags: ['object', 'parsing'],
    examples: [
      { input: '{"a.b.c": 1}', output: '{a: {b: {c: 1}}}' },
    ],
    constraints: ['Handle dot notation keys'],
    bruteForce: {
      code: `function unflatten(obj) {
  const result = {};
  
  for (const key in obj) {
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = obj[key];
  }
  
  return result;
}`,
      explanation: 'Split keys by dot and create nested structure.',
      timeComplexity: 'O(n × k) where k is average key depth',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function unflatten(obj) {
  const result = {};
  
  for (const flatKey in obj) {
    const keys = flatKey.split('.');
    keys.reduce((acc, key, index) => {
      if (index === keys.length - 1) {
        acc[key] = obj[flatKey];
      } else {
        acc[key] = acc[key] || {};
      }
      return acc[key];
    }, result);
  }
  
  return result;
}`,
      explanation: 'Use reduce to build nested structure.',
      timeComplexity: 'O(n × k)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Split each key by dots', 'Create nested objects as you traverse']
  },
  {
    id: 'obj-4',
    category: 'object',
    title: 'Object Deep Equal',
    description: 'Check if two objects are deeply equal',
    difficulty: 'medium',
    tags: ['recursion', 'object'],
    examples: [
      { input: '{a: {b: 1}}, {a: {b: 1}}', output: 'true' },
    ],
    constraints: ['Handle nested objects and arrays'],
    bruteForce: {
      code: `function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}`,
      explanation: 'Compare JSON strings (order-dependent).',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
      obj1 === null || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => 
    keys2.includes(key) && deepEqual(obj1[key], obj2[key])
  );
}`,
      explanation: 'Recursively compare all properties.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(d) where d is depth'
    },
    hints: ['Compare keys first, then values', 'Recursively check nested objects']
  },
  {
    id: 'obj-5',
    category: 'object',
    title: 'Object Diff',
    description: 'Find differences between two objects',
    difficulty: 'medium',
    tags: ['recursion', 'object'],
    examples: [
      { input: '{a: 1, b: 2}, {a: 1, b: 3}', output: '{b: {old: 2, new: 3}}' },
    ],
    constraints: ['Return object with old and new values'],
    bruteForce: {
      code: `function objectDiff(obj1, obj2) {
  const diff = {};
  
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = { old: obj1[key], new: obj2[key] };
    }
  }
  
  return diff;
}`,
      explanation: 'Compare all keys and track differences.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function objectDiff(obj1, obj2) {
  const diff = {};
  
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    if (typeof val1 === 'object' && typeof val2 === 'object' &&
        val1 !== null && val2 !== null) {
      const nestedDiff = objectDiff(val1, val2);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } else if (val1 !== val2) {
      diff[key] = { old: val1, new: val2 };
    }
  }
  
  return diff;
}`,
      explanation: 'Recursively compare and track differences.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Get union of all keys', 'Track old and new values for differences']
  },
  {
    id: 'obj-6',
    category: 'object',
    title: 'Merge Objects Deep',
    description: 'Deep merge multiple objects',
    difficulty: 'medium',
    tags: ['recursion', 'object'],
    examples: [
      { input: '{a: {b: 1}}, {a: {c: 2}}', output: '{a: {b: 1, c: 2}}' },
    ],
    constraints: ['Later objects override earlier ones'],
    bruteForce: {
      code: `function mergeDeep(...objects) {
  return objects.reduce((acc, obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null &&
          typeof acc[key] === 'object' && acc[key] !== null) {
        acc[key] = mergeDeep(acc[key], obj[key]);
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
}`,
      explanation: 'Recursively merge objects using reduce.',
      timeComplexity: 'O(n × m) where m is number of objects',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return mergeDeep(target, ...sources);
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}`,
      explanation: 'Process sources one by one, recursively merging.',
      timeComplexity: 'O(n × m)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Check if both values are objects before merging', 'Primitives should override']
  },
  {
    id: 'obj-7',
    category: 'object',
    title: 'Get Value by Path',
    description: 'Get value from object using dot or bracket notation path',
    difficulty: 'easy',
    tags: ['object', 'parsing'],
    examples: [
      { input: '{a: {b: [1, 2, 3]}}, "a.b[1]"', output: '2' },
    ],
    constraints: ['Handle both dot and bracket notation'],
    bruteForce: {
      code: `function get(obj, path, defaultValue) {
  const keys = path.replace(/\\[([^\\]]+)\\]/g, '.$1').split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}`,
      explanation: 'Convert bracket notation to dot notation and traverse.',
      timeComplexity: 'O(k) where k is path length',
      spaceComplexity: 'O(k)'
    },
    optimized: {
      code: `function get(obj, path, defaultValue) {
  const keys = path
    .replace(/\\[([^\\]]+)\\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  
  return keys.reduce((acc, key) => {
    return acc?.[key];
  }, obj) ?? defaultValue;
}`,
      explanation: 'Use optional chaining with reduce.',
      timeComplexity: 'O(k)',
      spaceComplexity: 'O(k)'
    },
    hints: ['Convert bracket notation to dot notation', 'Handle undefined values gracefully']
  },
  {
    id: 'obj-8',
    category: 'object',
    title: 'Set Value by Path',
    description: 'Set value in object using path, creating nested objects as needed',
    difficulty: 'medium',
    tags: ['object', 'parsing'],
    examples: [
      { input: '{}, "a.b.c", 1', output: '{a: {b: {c: 1}}}' },
    ],
    constraints: ['Create intermediate objects if needed'],
    bruteForce: {
      code: `function set(obj, path, value) {
  const keys = path.replace(/\\[([^\\]]+)\\]/g, '.$1').split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
}`,
      explanation: 'Traverse path, creating objects as needed.',
      timeComplexity: 'O(k)',
      spaceComplexity: 'O(k)'
    },
    optimized: {
      code: `function set(obj, path, value) {
  const keys = path
    .replace(/\\[([^\\]]+)\\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  
  keys.reduce((acc, key, index) => {
    if (index === keys.length - 1) {
      acc[key] = value;
    } else {
      acc[key] = acc[key] || {};
    }
    return acc[key];
  }, obj);
  
  return obj;
}`,
      explanation: 'Use reduce to traverse and set.',
      timeComplexity: 'O(k)',
      spaceComplexity: 'O(k)'
    },
    hints: ['Create intermediate objects if they do not exist', 'Handle the last key specially']
  },
  {
    id: 'obj-9',
    category: 'object',
    title: 'Pick Object Keys',
    description: 'Create object with only specified keys',
    difficulty: 'easy',
    tags: ['object'],
    examples: [
      { input: '{a: 1, b: 2, c: 3}, ["a", "c"]', output: '{a: 1, c: 3}' },
    ],
    constraints: ['Only include keys that exist'],
    bruteForce: {
      code: `function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}`,
      explanation: 'Loop through keys and copy matching properties.',
      timeComplexity: 'O(k) where k is number of keys',
      spaceComplexity: 'O(k)'
    },
    optimized: {
      code: `function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}`,
      explanation: 'Use reduce for cleaner code.',
      timeComplexity: 'O(k)',
      spaceComplexity: 'O(k)'
    },
    hints: ['Check if key exists before copying', 'Use reduce for functional approach']
  },
  {
    id: 'obj-10',
    category: 'object',
    title: 'Omit Object Keys',
    description: 'Create object without specified keys',
    difficulty: 'easy',
    tags: ['object'],
    examples: [
      { input: '{a: 1, b: 2, c: 3}, ["b"]', output: '{a: 1, c: 3}' },
    ],
    constraints: ['Remove only specified keys'],
    bruteForce: {
      code: `function omit(obj, keys) {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}`,
      explanation: 'Copy object and delete specified keys.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    optimized: {
      code: `function omit(obj, keys) {
  const keysSet = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysSet.has(key))
  );
}`,
      explanation: 'Filter entries that are not in keys set.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    hints: ['Use Set for O(1) key lookup', 'Filter object entries']
  },
]
