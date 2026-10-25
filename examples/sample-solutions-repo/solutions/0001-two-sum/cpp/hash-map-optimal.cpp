#include <vector>
#include <unordered_map>

/**
 * Problem 0001: Two Sum
 * Approach: Single-pass Hash Map
 * Time Complexity: O(N)
 * Space Complexity: O(N)
 */
class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> numToIndex;
        for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
            int complement = target - nums[i];
            auto it = numToIndex.find(complement);
            if (it != numToIndex.end()) {
                return {it->second, i};
            }
            numToIndex[nums[i]] = i;
        }
        return {};
    }
};
