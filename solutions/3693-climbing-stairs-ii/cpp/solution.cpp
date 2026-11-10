// Calculate costs for jumping 1, 2, or 3 steps
            long long cost_jump_1 = dp_minus_1 + current_cost + 1;
            long long cost_jump_2 = (i >= 2) ? (dp_minus_2 + current_cost + 4) : 1e18;
            long long cost_jump_3 = (i >= 3) ? (dp_minus_3 + current_cost + 9) : 1e18;
            
            long long current_dp = min({cost_jump_1, cost_jump_2, cost_jump_3});
            
            // Shift the DP state window forward
            dp_minus_3 = dp_minus_2;
            dp_minus_2 = dp_minus_1;
            dp_minus_1 = current_dp;
        }
        
        return static_cast<int>(dp_minus_1);
    }
};