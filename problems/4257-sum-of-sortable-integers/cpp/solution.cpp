#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int sortableIntegers(vector<int>& nums) {
        int n = nums.size();
        vector<int> sorted_nums = nums;
        sort(sorted_nums.begin(), sorted_nums.end());
        
        // Lambda function to check if a divisor k is sortable
        auto check = [&](int k) {
            for (int i = 0; i < n; i += k) {
                int drops = 0;
                int drop_idx = -1;
                
                // Count the number of strict cyclic drops in the current block
                for (int j = 0; j < k; j++) {
                    if (nums[i + j] > nums[i + (j + 1) % k]) {
                        drops++;
                        drop_idx = j;
                    }
                }
                
                // If a block has more than 1 cyclic drop, it cannot be sorted by rotation
                if (drops > 1) return false;
                
                // Determine the starting index of the sorted version of this block
                int start_idx = 0;
                if (drops == 1) {
                    start_idx = (drop_idx + 1) % k;
                }
                
                // Validate if the rotated block matches the globally sorted block
                for (int m = 0; m < k; m++) {
                    if (nums[i + (start_idx + m) % k] != sorted_nums[i + m]) {
                        return false;
                    }
                }
            }
            return true;
        };
        
        int ans = 0;
        // Iterate through all possible divisors of n
        for (int k = 1; k <= n; k++) {
            if (n % k == 0) {
                if (check(k)) {
                    ans += k;
                }
            }
        }
        
        return ans;
    }
};
