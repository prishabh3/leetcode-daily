class Solution {
public:
    string removeOuterParentheses(string s) {
        string result = "";
        int depth = 0;
        
        for (char c : s) {
            if (c == '(') {
                // If we are already inside a valid block (depth > 0), 
                // this is an inner bracket, so we keep it.
                if (depth > 0) {
                    result += c;
                }
                depth++; // Go one layer deeper
            } else if (c == ')') {
                depth--; // Step out one layer
                // If we haven't reached the absolute outside (depth == 0) yet,
                // this is an inner bracket, so we keep it.
                if (depth > 0) {
                    result += c;
                }
            }
        }
        
        return result;
    }
};