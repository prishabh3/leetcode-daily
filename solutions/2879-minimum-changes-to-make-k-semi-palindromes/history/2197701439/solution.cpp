#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minimumChanges(string s, int k) {
        int n = s.length();
        // cost[i][j] stores the min changes to make substring s[i..j] a semi-palindrome
        vector<vector<int>> cost(n, vector<int>(n, 1e9));
        
        // Precompute costs for all substrings of length >= 2
        for (int L = 2; L <= n; ++L) {
            vector<int> divs;
            for (int d = 1; d < L; ++d) {
                if (L % d == 0) divs.push_back(d);
            }
            
            for (int i = 0; i <= n - L; ++i) {
                int j = i + L - 1;
                int min_c = 1e9;
                
                // Check all valid divisors for the current substring length
                for (int d : divs) {
                    int c = 0;
                    int cnt = L / d;
                    
                    // Count character mismatches in each of the d groups
                    for (int m = 0; m < d; ++m) {
                        for (int step = 0; step < cnt / 2; ++step) {
                            if (s[i + m + step * d] != s[i + m + (cnt - 1 - step) * d]) {
                                c++;
                            }
                        }
                    }
                    if (c < min_c) min_c = c;
                }
                cost[i][j] = min_c;
            }
        }
        
        // dp[i][p] = min cost to partition the first i characters into p substrings
        vector<vector<int>> dp(n + 1, vector<int>(k + 1, 1e9));
        dp[0][0] = 0;
        
        for (int i = 1; i <= n; ++i) {
            for (int p = 1; p <= k; ++p) {
                // Ensure every partitioned substring has a length of at least 2
                for (int j = 0; j <= i - 2; ++j) { 
                    if (dp[j][p - 1] != 1e9 && cost[j][i - 1] != 1e9) {
                        dp[i][p] = min(dp[i][p], dp[j][p - 1] + cost[j][i - 1]);
                    }
                }
            }
        }
        
        return dp[n][k];
    }
};