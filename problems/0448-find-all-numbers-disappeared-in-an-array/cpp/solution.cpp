#include <vector>
#include <cmath>

class Solution {
public:
    std::vector<int> findDisappearedNumbers(std::vector<int>& nums) {
        std::vector<int> result;
        
        // Step 1: Mark visited indices by making the numbers at those indices negative
        for (int i = 0; i < nums.size(); ++i) {
            int index = std::abs(nums[i]) - 1;
            if (nums[index] > 0) {
                nums[index] = -nums[index];
            }
        }
        
        // Step 2: Any index that remains positive means its corresponding number (index + 1) is missing
        for (int i = 0; i < nums.size(); ++i) {
            if (nums[i] > 0) {
                result.push_back(i + 1);
            }
        }
        
        return result;
    }
};
