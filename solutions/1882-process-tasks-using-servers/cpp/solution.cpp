priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> free_servers;
        
        // busy_servers stores tuples of {time_free, weight, index}
        priority_queue<tuple<long long, int, int>, vector<tuple<long long, int, int>>, greater<tuple<long long, int, 
        int>>> busy_servers;
using namespace std;

class Solution {
public:
    vector<int> assignTasks(vector<int>& servers, vector<int>& tasks) {
        // free_servers stores pairs of {weight, index}
#include <vector>
#include <queue>
#include <tuple>
#include <algorithm>