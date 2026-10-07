class Solution {
public:
    vector<string> removeInvalidParentheses(string s) {
        vector<string> result;
        unordered_set<string> visited; // Keeps track of strings we've already checked
        queue<string> q;               // Our waitlist for strings to check
        
        q.push(s);
        visited.insert(s);
        
        bool foundValidAtCurrentLevel = false;
        
        while (!q.empty()) {
            string current = q.front();
            q.pop();
            
            // If it's valid, add it to our final answers
            if (isValid(current)) {
                result.push_back(current);
                foundValidAtCurrentLevel = true; 
            }
            
            // If we've already found valid strings at this level of removals,
            // we stop generating strings with EVEN MORE removals. 
            // But we still finish checking the current waitlist.
            if (foundValidAtCurrentLevel) {
                continue;
            }
            
            // Generate all possible new strings by removing exactly one parenthesis
            for (int i = 0; i < current.length(); i++) {
                // Ignore letters, we only want to try removing brackets
                if (current[i] != '(' && current[i] != ')') continue;
                
                // Create a new string with the i-th character removed
                string nextStr = current.substr(0, i) + current.substr(i + 1);
                
                // If we haven't seen this exact string before, add it to the waitlist
                if (visited.find(nextStr) == visited.end()) {
                    q.push(nextStr);
                    visited.insert(nextStr);
                }
            }
        }
        
        return result;
    }
    
private:
    // Helper function to check if a string is perfectly balanced
    bool isValid(string s) {
        int openCount = 0;
        for (char c : s) {
            if (c == '(') openCount++;
            else if (c == ')') openCount--;
            
            // If we ever have more closing than opening, it's permanently invalid
            if (openCount < 0) return false; 
        }
        return openCount == 0;
    }
};