#include <vector>

using namespace std;

class Solution {
public:
    int uniquePaths(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        int MOD = 1e9 + 7;
        
        // dp[r][c][0] : ways entering (r, c) moving RIGHT
        // dp[r][c][1] : ways entering (r, c) moving DOWN
        vector<vector<vector<int>>> dp(m, vector<vector<int>>(n, vector<int>(2, 0)));
        
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                long long w = 0;
                
                // Base case for the start position
                if (r == 0 && c == 0) {
                    w = 1;
                } else {
                    w = (dp[r][c][0] + dp[r][c][1]) % MOD;
                }
                
                if (grid[r][c] == 0) {
                    // Empty cell: The robot can initiate a new move RIGHT or DOWN
                    if (c + 1 < n) {
                        dp[r][c + 1][0] = (dp[r][c + 1][0] + w) % MOD;
                    }
                    if (r + 1 < m) {
                        dp[r + 1][c][1] = (dp[r + 1][c][1] + w) % MOD;
                    }
                } else {
                    // Mirror cell: Deterministic reflection
                    // Paths that entered moving RIGHT are turned DOWN
                    if (r + 1 < m) {
                        dp[r + 1][c][1] = (dp[r + 1][c][1] + dp[r][c][0]) % MOD;
                    }
                    // Paths that entered moving DOWN are turned RIGHT
                    if (c + 1 < n) {
                        dp[r][c + 1][0] = (dp[r][c + 1][0] + dp[r][c][1]) % MOD;
                    }
                }
            }
        }
        
        // Handle 1x1 grid edge case directly
        if (m == 1 && n == 1) return 1;
        
        // The total ways to reach the bottom-right target
        return (dp[m - 1][n - 1][0] + dp[m - 1][n - 1][1]) % MOD;
    }
};