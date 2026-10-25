class Solution {
private:
    void dfs(vector<vector<int>>& grid, int r, int c) {
        // Base case: boundary check or if the cell is water (1)
        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != 0) {
            return;
        }
        
        // Mark the current land cell as visited by turning it into water (1)
        grid[r][c] = 1;
        
        // Traverse all 4 adjacent directions
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }

public:
    int closedIsland(vector<vector<int>>& grid) {
        int rows = grid.size();
        int cols = grid[0].size();
        
        // Step 1: Flood-fill and eliminate all land (0) touching the outer borders
        for (int r = 0; r < rows; ++r) {
            dfs(grid, r, 0);            // Leftmost column
            dfs(grid, r, cols - 1);     // Rightmost column
        }
        for (int c = 0; c < cols; ++c) {
            dfs(grid, 0, c);            // Top row
            dfs(grid, rows - 1, c);     // Bottom row
        }
        
        // Step 2: Count the remaining isolated islands inside the interior grid
        int closedIslandsCount = 0;
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) {
                if (grid[r][c] == 0) {
                    closedIslandsCount++;
                    dfs(grid, r, c); // Sink the rest of this closed island
                }
            }
        }
        
        return closedIslandsCount;
    }
};
