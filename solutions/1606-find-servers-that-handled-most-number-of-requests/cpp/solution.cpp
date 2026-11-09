busy_servers.push({arr_time + load_time, chosen_server});
        }
        
        // Find the maximum number of requests handled by any server
        int max_handled = *max_element(handled.begin(), handled.end());
        vector<int> busiest;
        
        // Collect all servers that handled the maximum number of requests
        for (int i = 0; i < k; ++i) {
            if (handled[i] == max_handled) {
                busiest.push_back(i);
            }
        }
        
        return busiest;
    }
};