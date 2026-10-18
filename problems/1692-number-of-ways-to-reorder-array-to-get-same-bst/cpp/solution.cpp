#include <vector>

using namespace std;

class Solution {
private:
    long long MOD = 1e9 + 7;
    vector<vector<long long>> table;

    long long dfs(const vector<int>& nums) {
        int n = nums.size();
        if (n <= 2) return 1; // Base case: 0, 1, or 2 elements have only 1 way

        vector<int> left, right;
        int root = nums[0];
        
        // Split elements into left and right subtrees
        for (int i = 1; i < n; ++i) {
            if (nums[i] < root) {
                left.push_back(nums[i]);
            } else {
                right.push_back(nums[i]);
            }
        }

        // Recursively find ways for subtrees
        long long left_ways = dfs(left);
        long long right_ways = dfs(right);

        // Combine using combinations: C(left_size + right_size, left_size)
        return (((table[n - 1][left.size()] * left_ways) % MOD) * right_ways) % MOD;
    }

public:
    int numOfWays(vector<int>& nums) {
        int n = nums.size();
        
        // Precompute Pascal's Triangle for combinations nCr
        table.resize(n + 1, vector<long long>(n + 1, 1));
        for (int i = 1; i <= n; ++i) {
            for (int j = 1; j < i; ++j) {
                table[i][j] = (table[i - 1][j - 1] + table[i - 1][j]) % MOD;
            }
        }
        
        // Subtract 1 to exclude the original permutation
        return (dfs(nums) - 1 + MOD) % MOD;
    }
};
