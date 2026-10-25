import heapq
from typing import List

class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        INF = 10 ** 20
        R = len(grid)
        C = len(grid[0])

        # distance[i][j] = minimum time to reach (i, j)
        distance = [[INF] * C for _ in range(R)]
        done = [[False] * C for _ in range(R)]
        h = []

        # Start from (0,0)
        distance[0][0] = grid[0][0]
        heapq.heappush(h, (distance[0][0], 0, 0))

        directions = [(1,0), (-1,0), (0,1), (0,-1)]

        while h:
            d, x, y = heapq.heappop(h)
            if done[x][y]:
                continue
            done[x][y] = True

            # If we reached bottom-right, return the time
            if x == R - 1 and y == C - 1:
                return d

            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 <= nx < R and 0 <= ny < C and not done[nx][ny]:
                    new_dist = max(d, grid[nx][ny])
                    if distance[nx][ny] > new_dist:
                        distance[nx][ny] = new_dist
                        heapq.heappush(h, (new_dist, nx, ny))

        return -1  # should never reach here
