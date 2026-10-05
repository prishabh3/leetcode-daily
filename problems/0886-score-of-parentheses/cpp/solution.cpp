class Solution {
public:
    int scoreOfParentheses(string s) {
        int score = 0;
        int depth = 0;
        
        for (int i = 0; i < s.length(); i++) {
            if (s[i] == '(') {
                depth++;
            } else {
                depth--;
                // Check if this ')' directly closes the previous '('
                // If it forms a base "()", add 2^(depth) to the score
                if (s[i - 1] == '(') {
                    score += 1 << depth; // 1 << depth is equivalent to 2^depth
                }
            }
        }
        
        return score;
    }
};