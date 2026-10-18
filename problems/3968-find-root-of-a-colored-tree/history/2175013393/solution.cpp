class Solution {
public:
    int findColoredRoot(vector<vector<int>>& edges, string colors) {
        int n = colors.length();
        vector<int> in(n, 0), deg(n, 0);

        auto valid = [](char a, char b) {
            return (a == 'R' && b == 'B') || (a == 'B' && b == 'W') || (a == 'W' && b == 'R');
        };

        for (auto& e : edges) {
            int u = e[0], v = e[1];
            deg[u]++; 
            deg[v]++;

            if (valid(colors[u], colors[v])) in[v]++;
            else if (valid(colors[v], colors[u])) in[u]++;
            else return -1;
        }

        int root = -1;
        for (int i = 0; i < n; i++) {
            if (in[i] == 0) {
                if (root != -1) return -1;
                root = i;
            } else if (in[i] != 1) {
                return -1;
            }
        }

        return (root != -1 && deg[root] <= 2) ? root : -1;
    }
};
