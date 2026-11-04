for (int j = 1; j <= k; ++j) {
                // Option A: Do not place a window ending at i-1
                dp[i][j] = dp[i - 1][j];
                
                // Option B: Place a window ending at i-1 (if enough space exists)
                if (i >= x) {
                    if (dp[i - x][j - 1] != INF) {
                        dp[i][j] = min(dp[i][j], dp[i - x][j - 1] + cost[i - 1]);
                    }
                }
            }
        }
        
        return dp[n][k];
    }
};