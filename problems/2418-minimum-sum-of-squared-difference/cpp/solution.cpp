#include <vector>
#include <cmath>
#include <algorithm>
#include <numeric>

class Solution {
public:
    long long minSumSquareDiff(std::vector<int>& nums1, std::vector<int>& nums2, int k1, int k2) {
        long long k = (long long)k1 + k2;
        int n = nums1.size();
        
        // Find the maximum difference to size our bucket array dynamically
        int max_diff = 0;
        std::vector<int> diffs(n);
        long long total_diff_sum = 0;
        
        for (int i = 0; i < n; ++i) {
            diffs[i] = std::abs(nums1[i] - nums2[i]);
            max_diff = std::max(max_diff, diffs[i]);
            total_diff_sum += diffs[i];
        }
        
        // If our budget k is enough to wipe out all differences completely
        if (total_diff_sum <= k) {
            return 0;
        }
        
        // Buckets to store frequencies of each difference value
        std::vector<long long> buckets(max_diff + 1, 0);
        for (int d : diffs) {
            buckets[d]++;
        }
        
        // Process greedily from the largest possible difference downwards
        for (int v = max_diff; v > 0; --v) {
            if (buckets[v] == 0) continue;
            
            // How many items of value 'v' can we shift down to 'v - 1'?
            long long take = std::min(buckets[v], k);
            
            buckets[v] -= take;
            buckets[v - 1] += take;
            k -= take;
            
            if (k == 0) break;
        }
        
        // Calculate the final sum of squared differences
        long long min_squared_sum = 0;
        for (long long v = 1; v <= max_diff; ++v) {
            if (buckets[v] > 0) {
                min_squared_sum += buckets[v] * (v * v);
            }
        }
        
        return min_squared_sum;
    }
};
