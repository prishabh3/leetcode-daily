#include <vector>
#include <string>
#include <sstream>

using namespace std;

class Solution {
    vector<vector<int>> adj;
    vector<int> tin, tout;
    vector<vector<int>> up;
    vector<int> depth;
    int timer;
    int LOG;

    // Fenwick Tree (Binary Indexed Tree) for point queries and range updates
    vector<int> bit;
    int bit_size;

    void update_bit(int idx, int val) {
        for (; idx < bit_size; idx += idx & -idx) {
            bit[idx] ^= val;
        }
    }

    int query_bit(int idx) {
        int sum = 0;
        for (; idx > 0; idx -= idx & -idx) {
            sum ^= bit[idx];
        }
        return sum;
    }

    // Range XOR update: flips bits in the range [l, r]
    void update_range(int l, int r, int val) {
        update_bit(l, val);
        update_bit(r + 1, val);
    }

    // DFS to compute Euler Tour, Depths, and Binary Lifting Table
    void dfs(int v, int p, int d, const string& s) {
        tin[v] = ++timer;
        depth[v] = d;
        up[v][0] = p;
        for (int i = 1; i < LOG; ++i) {
            up[v][i] = up[up[v][i - 1]][i - 1];
        }

        int char_mask = 1 << (s[v] - 'a');
        update_range(tin[v], tin[v], char_mask); // Add self to its own position

        for (int u : adj[v]) {
            if (u != p) {
                dfs(u, v, d + 1, s);
            }
        }
        tout[v] = timer;
    }

    // LCA function using Binary Lifting
    int get_lca(int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);
        for (int i = LOG - 1; i >= 0; --i) {
            if (depth[u] - (1 << i) >= depth[v]) {
                u = up[u][i];
            }
        }
        if (u == v) return u;
        for (int i = LOG - 1; i >= 0; --i) {
            if (up[u][i] != up[v][i]) {
                u = up[u][i];
                v = up[v][i];
            }
        }
        return up[u][0];
    }

public:
    vector<bool> palindromePath(int n, vector<vector<int>>& edges, string s, vector<string>& queries) {
        adj.assign(n, vector<int>());
        for (const auto& edge : edges) {
            adj[edge[0]].push_back(edge[1]);
            adj[edge[1]].push_back(edge[0]);
        }

        tin.resize(n);
        tout.resize(n);
        depth.resize(n);
        timer = 0;
        LOG = 0;
        while ((1 << LOG) <= n) LOG++;
        up.assign(n, vector<int>(LOG));

        bit_size = n + 2;
        bit.assign(bit_size, 0);

        // Precompute tree structures
        dfs(0, 0, 0, s);

        // Propagate prefix XORs from parents to children down the BIT
        // So that query_bit(tin[x]) yields the path mask from root to x
        vector<int> current_s(n);
        for (int i = 0; i < n; ++i) current_s[i] = 1 << (s[i] - 'a');
        
        // Correcting the BIT initialization to represent root-to-node path masks
        bit.assign(bit_size, 0);
        auto init_dfs = [&](auto self, int v, int p, int mask) -> void {
            mask ^= current_s[v];
            update_range(tin[v], tin[v], mask);
            for (int u : adj[v]) {
                if (u != p) self(self, u, v, mask);
            }
        };
        init_dfs(init_dfs, 0, 0, 0);

        vector<bool> ans;

        for (const string& q : queries) {
            stringstream ss(q);
            string type;
            ss >> type;

            if (type == "update") {
                int u;
                char c;
                ss >> u >> c;

                int old_mask = current_s[u];
                int new_mask = 1 << (c - 'a');
                int change_mask = old_mask ^ new_mask;

                if (change_mask != 0) {
                    // Range update all nodes in u's subtree
                    update_range(tin[u], tout[u], change_mask);
                    current_s[u] = new_mask;
                }
            } else if (type == "query") {
                int u, v;
                ss >> u >> v;

                int lca = get_lca(u, v);
                
                // Fetch root-to-node masks from the Fenwick tree
                int mask_u = query_bit(tin[u]);
                int mask_v = query_bit(tin[v]);
                int mask_lca_char = current_s[lca];

                int path_mask = mask_u ^ mask_v ^ mask_lca_char;

                // Check if at most one bit is set
                bool is_palindrome = (path_mask == 0) || ((path_mask & (path_mask - 1)) == 0);
                ans.push_back(is_palindrome);
            }
        }

        return ans;
    }
};
