#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minCost(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        
        // dp[i][j][k] indicates if XOR sum 'k' is reachable at cell (i, j)
        // Max value is 1023, so XOR sum won't exceed 2047. 2048 covers all possibilities.
        vector<vector<vector<bool>>> dp(m, vector<vector<bool>>(n, vector<bool>(2048, false)));
        
        // Base case: Starting cell
        dp[0][0][grid[0][0]] = true;
        
        // Traverse the grid row by row
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (i == 0 && j == 0) continue;
                
                int current_val = grid[i][j];
                
                // Transition from the cell above
                if (i > 0) {
                    for (int k = 0; k < 2048; ++k) {
                        if (dp[i - 1][j][k]) {
                            dp[i][j][k ^ current_val] = true;
                        }
                    }
                }
                
                // Transition from the cell to the left
                if (j > 0) {
                    for (int k = 0; k < 2048; ++k) {
                        if (dp[i][j - 1][k]) {
                            dp[i][j][k ^ current_val] = true;
                        }
                    }
                }
            }
        }
        
        // Find the minimum reachable XOR value at the destination
        for (int k = 0; k < 2048; ++k) {
            if (dp[m - 1][n - 1][k]) {
                return k;
            }
        }
        
        return -1; // Fallback (should not be reached based on constraints)
    }
};
