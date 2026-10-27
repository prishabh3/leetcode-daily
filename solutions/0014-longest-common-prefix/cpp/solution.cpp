class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        // If the input vector is empty, return an empty string
        if (strs.empty()) return "";
        
        // Sort the array of strings alphabetically
        sort(strs.begin(), strs.end());
        
        // Compare the first and last string after sorting
        string first = strs[0];
        string last = strs[strs.size() - 1];
        string result = "";
        
        // Find the common characters between the first and last string
        for (int i = 0; i < min(first.size(), last.size()); i++) {
            if (first[i] == last[i]) {
                result += first[i];
            } else {
                break;
            }
        }
        
        return result;
    }
};
