# Two Sum

- **Problem ID**: 0001
- **Difficulty**: Easy
- **LeetCode URL**: [Two Sum](https://leetcode.com/problems/two-sum/)
- **Tags**: Array, Hash Table
- **Patterns**: Hash Map, Complement Lookup

---

## 1. Problem Intuition
Instead of searching pairs with nested loops ($O(N^2)$), compute what each number needs ($target - num$) and check if we have already encountered that value.

## 2. Key Observation
We can record elements as we iterate through the array. When examining index $i$, the complement $target - nums[i]$ only needs to have appeared at any index $j < i$.

## 3. Algorithm or Approach
1. Initialize an empty hash map `numToIndex` mapping values to their indices.
2. For each element $nums[i]$:
   - Compute `complement = target - nums[i]`.
   - If `complement` is in `numToIndex`, return `{numToIndex[complement], i}`.
   - Otherwise, store `numToIndex[nums[i]] = i`.
3. Return empty vector if no pair satisfies the condition.

## 4. Why the Approach Works
Every pair of indices $(j, i)$ with $j < i$ will eventually be tested when the loop reaches the later index $i$, because $nums[j]$ is guaranteed to already be stored in the hash map.

## 5. Complexity Analysis
- **Time Complexity**: $O(N)$ average time complexity because hash table lookups and insertions operate in $O(1)$ amortized time.
- **Space Complexity**: $O(N)$ auxiliary memory required to store up to $N$ entries in the hash table.

## 6. Edge Cases
- Minimum length array ($N = 2$).
- Negative numbers and zero values in the array.
- Duplicate numbers summing to target (e.g. `[3, 3]`, target `6`). Single-pass map correctly resolves this without collision overwriting prematurely.

## 7. Mistakes Made During Initial Attempt
Attempting to sort first without tracking original indices, which alters array positions and requires additional $O(N)$ space or pairs.

## 8. Simpler Explanation for Future Revision
Iterate through numbers. Remember what you've seen in a map. When you see $target - current$, you found your match.
