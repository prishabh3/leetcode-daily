#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> seen;
        
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            
            // If complement is found, return both indices
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            
            // Otherwise, add the current number and its index to the map
            seen[nums[i]] = i;
        }
        
        return {};
    }
};