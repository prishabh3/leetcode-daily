#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minOperations(vector<int>& nums) {
        int n = nums.size();
        if (n <= 1) return 0;

        // Find the index of 0
        int idx = 0;
        for (int i = 0; i < n; ++i) {
            if (nums[i] == 0) {
                idx = i;
                break;
            }
        }

        // Check if it's Type A (increasing cyclic shift)
        bool is_A = true;
        for (int k = 0; k < n; ++k) {
            if (nums[(idx + k) % n] != k) {
                is_A = false;
                break;
            }
        }

        if (is_A) {
            int k_val = nums[0];
            // Option 1: Only left rotations
            int cost_via_L = (n - k_val) % n;
            // Option 2: Reverse -> Rotate -> Reverse
            int cost_via_R = k_val + 2;
            
            return min(cost_via_L, cost_via_R);
        }

        // Check if it's Type B (decreasing cyclic shift)
        bool is_B = true;
        for (int k = 0; k < n; ++k) {
            if (nums[(idx - k + n) % n] != k) {
                is_B = false;
                break;
            }
        }

        if (is_B) {
            int m_val = nums[0];
            // Option 1: Reverse first, then rotate the resulting Type A array
            int cost_via_R = 1 + (n - m_val - 1) % n;
            // Option 2: Rotate first to B_{n-1}, then reverse
            int cost_via_L = ((m_val + 1) % n) + 1;
            
            return min(cost_via_R, cost_via_L);
        }

        return -1;
    }
};
