class Solution {
public:
    int longestValidParentheses(string s) {
        stack<int> st;
        // Push -1 to serve as the base/starting line for the first valid sequence
        st.push(-1); 
        int maxLength = 0;
        
        for (int i = 0; i < s.length(); i++) {
            if (s[i] == '(') {
                // If opening bracket, push its index onto the stack
                st.push(i);
            } else {
                // If closing bracket, pop the last opening bracket's index
                st.pop();
                
                if (st.empty()) {
                    // If the stack is empty, this closing bracket is invalid.
                    // We push its index to act as the new base/starting line.
                    st.push(i);
                } else {
                    // The substring from the current top of the stack to 'i' is valid.
                    // Calculate its length and update maxLength if it's the biggest so far.
                    maxLength = max(maxLength, i - st.top());
                }
            }
        }
        
        return maxLength;
    }
};