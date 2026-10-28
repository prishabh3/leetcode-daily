}
                }
            }
        }
        
        // Find the minimum reachable XOR value at the destination
        for (int k = 0; k < 2048; ++k) {
            if (dp[m - 1][n - 1][k]) {
                return k;
            }
        }
        
        return -1; // Fallback (should not be reached based on constraints)
    }
};