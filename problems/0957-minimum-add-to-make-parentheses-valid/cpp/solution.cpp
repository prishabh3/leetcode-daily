class Solution {
public:
    int minAddToMakeValid(string s) {
        int openCount = 0;  // Tracks unmatched '('
        int insertions = 0; // Tracks insertions needed for unmatched ')'

        for (char c : s) {
            if (c == '(') {
                // We have a new open bracket waiting to be closed
                openCount++;
            } else {
                // We have a closing bracket
                if (openCount > 0) {
                    // It successfully matches a waiting open bracket
                    openCount--;
                } else {
                    // There is no open bracket to match this!
                    // We are forced to insert an artificial '(' right here.
                    insertions++;
                }
            }
        }

        // At the very end, if we still have unmatched '(' brackets, 
        // we must insert a ')' for each one of them to make the string valid.
        return insertions + openCount;
    }
};