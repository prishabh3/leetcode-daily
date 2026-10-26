#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    int countIslands(vector<vector<int>>& grid, int k) {
        int m = grid.size();
        int n = grid[0].size();
        int divisibleIslandsCount = 0;

        // Direction arrays for 4-directional movement: up, down, left, right
        int dRow[] = {-1, 1, 0, 0};
        int dCol[] = {0, 0, -1, 1};

        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                // Found a piece of land that hasn't been visited yet
                if (grid[i][j] > 0) {
                    long long islandSum = 0;
                    queue<pair<int, int>> q;

                    // Initialize BFS
                    q.push({i, j});
                    islandSum += grid[i][j];
                    grid[i][j] = 0; // Mark as visited by sinking the land

                    while (!q.empty()) {
                        auto [r, c] = q.front();
                        q.pop();

                        // Explore all 4 neighbors
                        for (int d = 0; d < 4; ++d) {
                            int newRow = r + dRow[d];
                            int newCol = c + dCol[d];

                            // Check boundary conditions and if the neighbor is valid land
                            if (newRow >= 0 && newRow < m && newCol >= 0 && newCol < n && grid[newRow][newCol] > 0) {
                                islandSum += grid[newRow][newCol];
                                grid[newRow][newCol] = 0; // Mark as visited
                                q.push({newRow, newCol});
                            }
                        }
                    }

                    // Check if the island's total value is divisible by k
                    if (islandSum % k == 0) {
                        divisibleIslandsCount++;
                    }
                }
            }
        }

        return divisibleIslandsCount;
    }
};
