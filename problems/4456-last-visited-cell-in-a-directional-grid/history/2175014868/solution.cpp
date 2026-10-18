class Solution {
public:
    vector<int> lastVisitedCell(vector<vector<char>>& grid) {
        int m = grid.size(), n = grid[0].size();
        int r = 0, c = 0;

        while (true) {
            char dir = grid[r][c];
            grid[r][c] = '#'; // Mark current cell as visited

            int nr = r + (dir == 'D') - (dir == 'U');
            int nc = c + (dir == 'R') - (dir == 'L');

            // Return current position if next move is invalid
            if (nr < 0 || nr >= m || nc < 0 || nc >= n || grid[nr][nc] == '#') {
                return {r, c};
            }

            r = nr;
            c = nc;
        }
    }
};
