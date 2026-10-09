class Solution {
public:
    int minInsertions(string s) {
        int insertions = 0;
        int open_needed = 0;
        int n = s.length();
        
        for (int i = 0; i < n; ++i) {
            if (s[i] == '(') {
                open_needed++;
            } else {
                // Check if this ')' is followed by another ')' to form the required "))"
                if (i + 1 < n && s[i + 1] == ')') {
                    i++; // Consume the second ')'
                } else {
                    insertions++; // Single ')' found; insert one ')' to make it "))"
                }
                
                // Match the completed "))" with an open '('
                if (open_needed > 0) {
                    open_needed--; // Successfully matched
                } else {
                    insertions++; // No '(' available; insert one '('
                }
            }
        }
        
        // Every remaining unmatched '(' requires two ')' insertions
        insertions += open_needed * 2;
        
        return insertions;
    }
};
