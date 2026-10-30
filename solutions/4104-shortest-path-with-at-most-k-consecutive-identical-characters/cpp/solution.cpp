#include <vector>
#include <string>
#include <queue>
#include <tuple>

using namespace std;

class Solution {
public:
    int shortestPath(int n, vector<vector<int>>& edges, string labels, int k) {
        // Build adjacency list: adj[u] = {(v, weight), ...}
        vector<vector<pair<int, int>>> adj(n);
        for (const auto& edge : edges) {
            adj[edge[0]].push_back({edge[1], edge[2]});
        }

        // Min-priority queue storing: {distance, current_node, consecutive_count}
        // Using greater to make it a min-heap based on distance
        priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<tuple<int, int, int>>> pq;
        
        // dist[u][count] stores the minimum weight to reach node u with 'count' consecutive identical characters
        vector<vector<int>> dist(n, vector<int>(k + 1, 1e9));

        // Base case: starting at node 0
        dist[0][1] = 0;
        pq.push({0, 0, 1});

        while (!pq.empty()) {
            auto [d, u, count] = pq.top();
            pq.pop();

            // If we found a shorter path to this state already, skip it
            if (d > dist[u][count]) continue;

            // If we reached the destination node, return the cost
            if (u == n - 1) return d;

            for (const auto& [v, w] : adj[u]) {
                int next_count = (labels[v] == labels[u]) ? count + 1 : 1;

                // Check if the state satisfies the constraint (<= k consecutive characters)
                if (next_count <= k) {
                    if (d + w < dist[v][next_count]) {
                        dist[v][next_count] = d + w;
                        pq.push({dist[v][next_count], v, next_count});
                    }
                }
            }
        }

        return -1;
    }
};
