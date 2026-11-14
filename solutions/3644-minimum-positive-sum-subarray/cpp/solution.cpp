#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minimumSumSubarray(vector<int>& nums, int l, int r) {
        int n = nums.size();
        int min_sum = 1e9; // Initialize with a large number as a proxy for infinity
        
        for (int i = 0; i < n; ++i) {
            int current_sum = 0;
            
            for (int j = i; j < n; ++j) {
                current_sum += nums[j];
                int len = j - i + 1;
                
                // Check if the current subarray meets all the specified conditions
                if (len >= l && len <= r && current_sum > 0) {
                    min_sum = min(min_sum, current_sum);
                }
            }
        }
        
        // If min_sum remains unchanged, it means no valid subarray was found
        return min_sum == 1e9 ? -1 : min_sum;
    }
};