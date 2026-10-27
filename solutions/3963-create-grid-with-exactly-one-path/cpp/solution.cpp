std::vector<std::string> grid(m, std::string(n, '#'));
        
        // Open the path along the first row: (0, 0) to (0, n-1)
        for (int j = 0; j < n; ++j) {
            grid[0][j] = '.';
        }
        
        // Open the path down the last column: (0, n-1) to (m-1, n-1)
        for (int i = 0; i < m; ++i) {
            grid[i][n - 1] = '.';
        }
        
        return grid;
    }
};