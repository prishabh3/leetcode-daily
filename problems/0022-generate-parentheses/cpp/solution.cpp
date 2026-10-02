class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        backtrack(result, "", 0, 0, n);
        return result;
    }
    
private:
    void backtrack(vector<string>& result, string current, int openCount, int closeCount, int maxPairs) {
        // Base case: if the current string has reached the maximum length (2 * n)
        if (current.length() == maxPairs * 2) {
            result.push_back(current);
            return;
        }
        
        // Rule 1: We can always add an opening bracket if we haven't used all 'n' of them
        if (openCount < maxPairs) {
            backtrack(result, current + "(", openCount + 1, closeCount, maxPairs);
        }
        
        // Rule 2: We can only add a closing bracket if there are unmatched opening brackets
        if (closeCount < openCount) {
            backtrack(result, current + ")", openCount, closeCount + 1, maxPairs);
        }
    }
};