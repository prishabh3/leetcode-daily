#include <vector>

class Solution {
public:
    int sortPermutation(std::vector<int>& nums) {
        int ans = -1;
        
        for (int i = 0; i < nums.size(); ++i) {
            // Check if the element is out of its sorted position
            if (nums[i] != i) {
                if (ans == -1) {
                    ans = nums[i];
                } else {
                    ans &= nums[i];
                }
            }
        }
        
        // If ans is still -1, it means the array was already sorted
        return (ans == -1) ? 0 : ans;
    }
};

