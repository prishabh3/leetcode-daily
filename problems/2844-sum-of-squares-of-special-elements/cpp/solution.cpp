#include <vector>

class Solution {
public:
    int sumOfSquares(std::vector<int>& nums) {
        int n = nums.size();
        int sum = 0;
        
        for (int i = 1; i <= n; ++i) {
            if (n % i == 0) {
                sum += nums[i - 1] * nums[i - 1]; // nums is 0-indexed in C++, so 1-indexed i corresponds to i - 1
            }
        }
        
        return sum;
    }
};
