#include <vector>
#include <queue>
#include <tuple>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> assignTasks(vector<int>& servers, vector<int>& tasks) {
        // free_servers stores pairs of {weight, index}
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> free_servers;
        
        // busy_servers stores tuples of {time_free, weight, index}
        priority_queue<tuple<long long, int, int>, vector<tuple<long long, int, int>>, greater<tuple<long long, int, int>>> busy_servers;
        
        int n = servers.size();
        int m = tasks.size();
        vector<int> ans(m);
        
        // Initially, all servers are free
        for (int i = 0; i < n; ++i) {
            free_servers.push({servers[i], i});
        }
        
        long long current_time = 0;
        
        for (int j = 0; j < m; ++j) {
            // If the current time is behind the arrival time of task j, catch up
            current_time = max(current_time, (long long)j);
            
            // If no servers are free, fast-forward time to when the next server becomes available
            if (free_servers.empty()) {
                current_time = max(current_time, get<0>(busy_servers.top()));
            }
            
            // Free up all servers that have finished their tasks by current_time
            while (!busy_servers.empty() && get<0>(busy_servers.top()) <= current_time) {
                auto [time_free, weight, index] = busy_servers.top();
                busy_servers.pop();
                free_servers.push({weight, index});
            }
            
            // Assign the current task to the best available free server
            auto [weight, index] = free_servers.top();
            free_servers.pop();
            
            ans[j] = index;
            
            // Push the server back into the busy queue with its new completion time
            busy_servers.push({current_time + tasks[j], weight, index});
        }
        
        return ans;
    }
};