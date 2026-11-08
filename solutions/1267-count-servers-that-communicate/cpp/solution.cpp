// Second pass: Check if each server can communicate
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == 1) {
                    // A server can communicate if its row or column has more than 1 server
                    if (rowCount[r] > 1 || colCount[c] > 1) {
                        communicableServers++;
                    }
                }
            }
        }
        
        return communicableServers;
    }
};