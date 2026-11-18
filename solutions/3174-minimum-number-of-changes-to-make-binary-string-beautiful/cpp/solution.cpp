#include <string>

using namespace std;

class Solution {
public:
    int minChanges(string s) {
        int changes = 0;
        
        // Iterate through the string in chunks of 2
        for (int i = 0; i < s.length(); i += 2) {
            if (s[i] != s[i + 1]) {
                changes++;
            }
        }
        
        return changes;
    }
};