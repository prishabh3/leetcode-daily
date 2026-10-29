#include <vector>
#include <string>
#include <sstream>

using namespace std;

class Solution {
    vector<vector<int>> adj;
    vector<int> tin, tout;
    vector<vector<int>> up;
    vector<int> depth;
    int timer;
    int LOG;

    // Fenwick Tree (Binary Indexed Tree) for point queries and range updates
    vector<int> bit;