while (left < num_logs && logs[left][1] < min_time) {
                int server = logs[left][0];
                freq[server]--;
                if (freq[server] == 0) {
                    unique_servers_active--;
                }
                left++;
            }
            
            // Servers that received NO requests = Total Servers - Active Servers
            ans[q_idx] = n - unique_servers_active;
        }
        
        return ans;
    }
};