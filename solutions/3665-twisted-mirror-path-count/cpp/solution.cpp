#include <vector>

using namespace std;

class Solution {
public:
    int uniquePaths(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        int MOD = 1e9 + 7;
        
        // dp[r][c][0] : ways entering (r, c) moving RIGHT
        // dp[r][c][1] : ways entering (r, c) moving DOWN
        vector<vector<vector<int>>> dp(m, vector<vector<int>>(n, vector<int>(2, 0)));
        
        for (int r = 0; r < m; ++r) {