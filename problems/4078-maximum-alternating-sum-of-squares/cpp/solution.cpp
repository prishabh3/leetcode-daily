#include <vector>
#include <algorithm>

class Solution {
public:
    long long maxAlternatingSum(std::vector<int>& nums) {
        int n = nums.size();
        std::vector<long long> squares(n);
        
        // Step 1: Compute squares using long long to prevent overflow
        for (int i = 0; i < n; ++i) {
            squares[i] = 1LL * nums[i] * nums[i];
        }
        
        // Step 2: Sort the squares in ascending order
        std::sort(squares.begin(), squares.end());
        
        long long max_score = 0;
        int m = n / 2;
        
        // Step 3: Subtract the smaller half of the squares
        for (int i = 0; i < m; ++i) {
            max_score -= squares[i];
        }
        
        // Step 4: Add the larger half of the squares
        for (int i = m; i < n; ++i) {
            max_score += squares[i];
        }
        
        return max_score;
    }
};
