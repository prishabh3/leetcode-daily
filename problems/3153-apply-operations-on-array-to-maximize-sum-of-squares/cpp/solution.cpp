#include <vector>

class Solution {
public:
    int maxSum(std::vector<int>& nums, int k) {
        long long MOD = 1e9 + 7;
        // Array to store the count of set bits at each position up to 30 bits
        std::vector<int> bitCount(31, 0);
        
        // Count the occurrences of each bit position
        for (int num : nums) {
            for (int i = 0; i < 31; ++i) {
                if ((num >> i) & 1) {
                    bitCount[i]++;
                }
            }
        }
        
        long long totalSumSquares = 0;
        
        // Form the k largest possible numbers greedily
        for (int step = 0; step < k; ++step) {
            long long currentNum = 0;
            for (int i = 0; i < 31; ++i) {
                if (bitCount[i] > 0) {
                    currentNum |= (1LL << i);
                    bitCount[i]--; // Consume one bit for this number
                }
            }
            // Add the square of the formed number to the total sum
            totalSumSquares = (totalSumSquares + (currentNum * currentNum) % MOD) % MOD;
        }
        
        return totalSumSquares;
    }
};
