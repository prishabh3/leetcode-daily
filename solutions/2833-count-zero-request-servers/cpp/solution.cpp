#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> countServers(int n, vector<vector<int>>& logs, int x, vector<int>& queries) {
        int num_queries = queries.size();
        
        // Pair of {query_time, original_index} to remember positions after sorting
        vector<pair<int, int>> sorted_queries(num_queries);
        for (int i = 0; i < num_queries; ++i) {
            sorted_queries[i] = {queries[i], i};
        }
        
        // Sort queries and logs by time
        sort(sorted_queries.begin(), sorted_queries.end());
        sort(logs.begin(), logs.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });
        
        vector<int> ans(num_queries);
        vector<int> freq(n + 1, 0); // Frequency map of requests per server in the current window
        int unique_servers_active = 0;
        
        int left = 0;
        int right = 0;
        int num_logs = logs.size();
        
        for (const auto& [q_time, q_idx] : sorted_queries) {
            int min_time = q_time - x;
            
            // Expand window on the right: include all logs up to the current query's end time
            while (right < num_logs && logs[right][1] <= q_time) {
                int server = logs[right][0];
                if (freq[server] == 0) {
                    unique_servers_active++;
                }
                freq[server]++;
                right++;
            }
            
            // Shrink window on the left: remove logs that fall before the window's start time
            while (left < num_logs && logs[left][1] < min_time) {
                int server = logs[left][0];
                freq[server]--;
                if (freq[server] == 0) {
                    unique_servers_active--;
                }
                left++;
            }
            
            // Servers that received NO requests = Total Servers - Active Servers
            ans[q_idx] = n - unique_servers_active;
        }
        
        return ans;
    }
};