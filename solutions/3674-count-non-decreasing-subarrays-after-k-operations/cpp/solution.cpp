#include <vector>

using namespace std;

class Solution {
public:
    long long countNonDecreasingSubarrays(vector<int>& nums, int k) {
        int n = nums.size();
        
        // S[i] stores the prefix sum of elements from nums[0] to nums[i-1]
        vector<long long> S(n + 1, 0);
        for (int i = 0; i < n; ++i) {
            S[i + 1] = S[i] + nums[i];
        }

        // Monotonic stack arrays mapped to blocks of maximums
        vector<int> st(n);
        vector<long long> area(n);
        vector<long long> pref_area(n + 1, 0);
        int sz = 0;

        long long ans = 0;
        int R = n - 1;

        for (int L = n - 1; L >= 0; --L) {
            // Update the stack to maintain decreasing left-to-right maximums
            while (sz > 0 && nums[L] >= nums[st[sz - 1]]) {
                sz--;
            }

            // Calculate the span (length) that this new maximum covers
            int length = (sz == 0) ? (n - L) : (st[sz - 1] - L);
            
            // Push current block starting at L to the stack
            st[sz] = L;
            area[sz] = 1LL * length * nums[L];
            pref_area[sz + 1] = pref_area[sz] + area[sz];
            sz++;

            // Shrink the sliding window from the right if the operation cost exceeds k
            while (R >= L) {
                // Binary search to find which block in the stack R falls into
                int low = 0, high = sz - 1;
                int j = 0;
                
                while (low <= high) {
                    int mid = low + (high - low) / 2;
                    if (st[mid] <= R) {
                        j = mid;
                        high = mid - 1; // Narrow down to find the tightest block (closest to 0)
                    } else {
                        low = mid + 1;
                    }
                }

                // Sum of prefix maximums over complete blocks entirely inside [L, R]
                long long sum_complete = pref_area[sz] - pref_area[j + 1];
                // Sum of prefix maximums for the partial block where R is situated
                long long partial = 1LL * (R - st[j] + 1) * nums[st[j]];
                
                long long current_cost = (sum_complete + partial) - (S[R + 1] - S[L]);

                // As soon as our window cost is valid, break (no need to shrink R further)
                if (current_cost <= k) {
                    break;
                }
                R--;
            }
            
            // Add all valid subarrays originating from the current L
            ans += (R - L + 1);
        }

        return ans;
    }
};