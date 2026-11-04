#include <vector>
#include <set>
#include <algorithm>

using namespace std;

class Solution {
public:
    long long minOperations(vector<int>& nums, int x, int k) {
        int n = nums.size();
        
        // cost[i] will store the minimum operations to equalize the subarray nums[i-x+1 ... i]
        vector<long long> cost(n, 0);
        
        multiset<int> left, right;
        long long sum_left = 0, sum_right = 0;
        
        // Helper to keep the left and right halves balanced
        auto balance = [&]() {
            int sz = left.size() + right.size();
            int target_left = (sz + 1) / 2;
            
            while (left.size() > target_left) {
                int val = *left.rbegin();
                left.erase(prev(left.end()));
                sum_left -= val;
                
                right.insert(val);
                sum_right += val;
            }
            while (left.size() < target_left) {
                int val = *right.begin();
                right.erase(right.begin());
                sum_right -= val;
                
                left.insert(val);
                sum_left += val;
            }
        };
        
        auto add_val = [&](int val) {
            if (left.empty() || val <= *left.rbegin()) {
                left.insert(val);
                sum_left += val;
            } else {
                right.insert(val);
                sum_right += val;
            }
            balance();
        };
        
        auto remove_val = [&](int val) {
            auto it = left.find(val);
            if (it != left.end()) {
                left.erase(it);
                sum_left -= val;
            } else {
                it = right.find(val);
                right.erase(it);
                sum_right -= val;
            }
            balance();
        };
        
        auto get_window_cost = [&]() -> long long {
            int sz = left.size() + right.size();
            if (sz == 0) return 0;
            
            long long median = *left.rbegin();
            if (sz % 2 == 0) {
                return sum_right - sum_left;
            } else {
                return sum_right - sum_left + median;
            }
        };
        
        // 1. Calculate costs for all sliding windows of size x
        for (int i = 0; i < n; ++i) {
            add_val(nums[i]);
            if (i >= x) {
                remove_val(nums[i - x]);
            }
            if (i >= x - 1) {
                cost[i] = get_window_cost();
            }
        }
        
        // 2. Dynamic Programming to find k non-overlapping windows with minimal cost
        const long long INF = 1e18;
        // dp[i][j] = min operations for j subarrays in prefix of length i
        vector<vector<long long>> dp(n + 1, vector<long long>(k + 1, INF));
        
        for (int i = 0; i <= n; ++i) {
            dp[i][0] = 0; 
        }
        
        for (int i = 1; i <= n; ++i) {
            for (int j = 1; j <= k; ++j) {
                // Option A: Do not place a window ending at i-1
                dp[i][j] = dp[i - 1][j];
                
                // Option B: Place a window ending at i-1 (if enough space exists)
                if (i >= x) {
                    if (dp[i - x][j - 1] != INF) {
                        dp[i][j] = min(dp[i][j], dp[i - x][j - 1] + cost[i - 1]);
                    }
                }
            }
        }
        
        return dp[n][k];
    }
};