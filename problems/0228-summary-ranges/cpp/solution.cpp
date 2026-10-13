#include <vector>
#include <string>

class Solution {
public:
    std::vector<std::string> summaryRanges(std::vector<int>& nums) {
        std::vector<std::string> result;
        int n = nums.size();
        
        if (n == 0) return result;
        
        for (int i = 0; i < n; i++) {
            int start = nums[i];
            
            // Keep moving forward as long as the next element is consecutive
            while (i + 1 < n && nums[i + 1] == nums[i] + 1) {
                i++;
            }
            
            // Format the range based on whether it has one or more elements
            if (start == nums[i]) {
                result.push_back(std::to_string(start));
            } else {
                result.push_back(std::to_string(start) + "->" + std::to_string(nums[i]));
            }
        }
        
        return result;
    }
};
