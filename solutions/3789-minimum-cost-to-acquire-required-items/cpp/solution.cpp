// Scenario 1: Buy 0 Type 3 items
        long long cost_0 = n1 * c1 + n2 * c2;
        
        // Scenario 2: Buy min(need1, need2) Type 3 items
        long long k_min = min(n1, n2);
        long long cost_min = k_min * cb + (n1 - k_min) * c1 + (n2 - k_min) * c2;
        
        // Scenario 3: Buy max(need1, need2) Type 3 items
        long long k_max = max(n1, n2);
        long long cost_max = k_max * cb;
        
        // Return the minimum of the three critical points
        return min({cost_0, cost_min, cost_max});
    }
};