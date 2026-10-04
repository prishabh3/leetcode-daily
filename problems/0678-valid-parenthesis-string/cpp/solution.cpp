class Solution {
public:
    bool checkValidString(string s) {
        int low = 0;   // Minimum possible open brackets '(' needed
        int high = 0;  // Maximum possible open brackets '(' possible

        for (char c : s) {
            if (c == '(') {
                low++;
                high++;
            } else if (c == ')') {
                low--;
                high--;
            } else if (c == '*') {
                // '*' can be:
                // 1. ')' -> decreases open count (low--)
                // 2. '(' -> increases open count (high++)
                // 3. ""  -> no change
                low--;
                high++;
            }

            // Even in the best-case scenario (all '*' acted as '('),
            // there are still too many ')' brackets.
            if (high < 0) {
                return false;
            }

            // low can never dip below 0 because we wouldn't choose '*' 
            // to act as ')' if there are no open brackets to match.
            low = max(low, 0);
        }

        // If minimum required open brackets is 0, we can match everything.
        return low == 0;
    }
};