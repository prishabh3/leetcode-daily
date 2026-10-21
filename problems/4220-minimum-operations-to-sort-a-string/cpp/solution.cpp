#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minOperations(string s) {
        int n = s.length();
        
        // 0 Operations: Already sorted
        if (is_sorted(s.begin(), s.end())) {
            return 0;
        }
        
        // Impossible case: Length <= 2 and not sorted
        if (n <= 2) {
            return -1;
        }
        
        // Find the absolute minimum and maximum characters
        char min_char = s[0];
        char max_char = s[0];
        for (char c : s) {
            if (c < min_char) min_char = c;
            if (c > max_char) max_char = c;
        }
        
        // 1 Operation: Boundary contains at least one correct extreme element
        if (s[0] == min_char || s[n - 1] == max_char) {
            return 1;
        }
        
        // 3 Operations: Only if max_char is exclusively at s[0] AND min_char is exclusively at s[n-1]
        if (s[0] == max_char && s[n - 1] == min_char) {
            bool duplicate_min_exists = false;
            bool duplicate_max_exists = false;
            
            // Check if min_char appears anywhere before the last character
            for (int i = 0; i < n - 1; ++i) {
                if (s[i] == min_char) duplicate_min_exists = true;
            }
            // Check if max_char appears anywhere after the first character
            for (int i = 1; i < n; ++i) {
                if (s[i] == max_char) duplicate_max_exists = true;
            }
            
            // If neither has duplicates in the interior, we are truly deadlocked
            if (!duplicate_min_exists && !duplicate_max_exists) {
                return 3;
            }
        }
        
        // 2 Operations: General case for length >= 3 (including strings like "jgg")
        return 2;
    }
};
