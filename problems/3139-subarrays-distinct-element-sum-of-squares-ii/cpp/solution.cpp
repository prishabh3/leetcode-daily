#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
    long long MOD = 1e9 + 7;
    vector<long long> sum1, sum2, lazy;

    void push(int node, int start, int end) {
        if (lazy[node] == 0) return;
        
        int mid = (start + end) / 2;
        int left_len = mid - start + 1;
        int right_len = end - mid;
        long long val = lazy[node];

        // Update left child
        sum2[2 * node] = (sum2[2 * node] + 2 * val * sum1[2 * node] + left_len * val * val) % MOD;
        sum1[2 * node] = (sum1[2 * node] + left_len * val) % MOD;
        lazy[2 * node] = (lazy[2 * node] + val) % MOD;

        // Update right child
        sum2[2 * node + 1] = (sum2[2 * node + 1] + 2 * val * sum1[2 * node + 1] + right_len * val * val) % MOD;
        sum1[2 * node + 1] = (sum1[2 * node + 1] + right_len * val) % MOD;
        lazy[2 * node + 1] = (lazy[2 * node + 1] + val) % MOD;

        lazy[node] = 0;
    }

    void update(int node, int start, int end, int l, int r, long long val) {
        if (r < start || end < l) return;
        if (l <= start && end <= r) {
            long long len = end - start + 1;
            sum2[node] = (sum2[node] + 2 * val * sum1[node] + len * val * val) % MOD;
            sum1[node] = (sum1[node] + len * val) % MOD;
            lazy[node] = (lazy[node] + val) % MOD;
            return;
        }
        push(node, start, end);
        int mid = (start + end) / 2;
        update(2 * node, start, mid, l, r, val);
        update(2 * node + 1, mid + 1, end, l, r, val);
        sum1[node] = (sum1[2 * node] + sum1[2 * node + 1]) % MOD;
        sum2[node] = (sum2[2 * node] + sum2[2 * node + 1]) % MOD;
    }

public:
    int sumCounts(vector<int>& nums) {
        int n = nums.size();
        sum1.assign(4 * n, 0);
        sum2.assign(4 * n, 0);
        lazy.assign(4 * n, 0);

        unordered_map<int, int> last_pos;
        long long total_sum = 0;

        for (int j = 0; j < n; ++j) {
            int last = last_pos.count(nums[j]) ? last_pos[nums[j]] : -1;
            
            // Increment the distinct count by 1 for all subarrays starting from last + 1 to j
            update(1, 0, n - 1, last + 1, j, 1);
            
            // Add the sum of squares of all subarrays ending at index j to the total answer
            total_sum = (total_sum + sum2[1]) % MOD;
            
            last_pos[nums[j]] = j;
        }

        return (total_sum + MOD) % MOD;
    }
};
