#include <vector>
#include <queue>
#include <set>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> busiestServers(int k, vector<int>& arrival, vector<int>& load) {
        vector<int> handled(k, 0);
        set<int> free_servers;
        
        // Initially, all servers are free
        for (int i = 0; i < k; ++i) {
            free_servers.insert(i);
        }
        
        // Min-heap to track busy servers: stores pairs of {finish_time, server_id}
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> busy_servers;
        
        int n = arrival.size();
        for (int i = 0; i < n; ++i) {
            long long arr_time = arrival[i];
            long long load_time = load[i];
            
            // Release servers that have completed their tasks by the current arrival time
            while (!busy_servers.empty() && busy_servers.top().first <= arr_time) {
                free_servers.insert(busy_servers.top().second);
                busy_servers.pop();
            }
            
            // If no servers are available, the request is dropped
            if (free_servers.empty()) {
                continue; 
            }
            
            // The preferred server for the ith request
            int target = i % k;
            
            // Find the first free server with ID >= target
            auto it = free_servers.lower_bound(target);
            
            // If no such server exists, wrap around to the first available server (ID < target)
            if (it == free_servers.end()) {
                it = free_servers.begin();
            }
            
            int chosen_server = *it;
            handled[chosen_server]++;
            
            // Mark the chosen server as busy
            free_servers.erase(it);
            busy_servers.push({arr_time + load_time, chosen_server});
        }
        
        // Find the maximum number of requests handled by any server
        int max_handled = *max_element(handled.begin(), handled.end());
        vector<int> busiest;
        
        // Collect all servers that handled the maximum number of requests
        for (int i = 0; i < k; ++i) {
            if (handled[i] == max_handled) {
                busiest.push_back(i);
            }
        }
        
        return busiest;
    }
};