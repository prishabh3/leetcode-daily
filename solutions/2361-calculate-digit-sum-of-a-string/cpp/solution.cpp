#include <string>

using namespace std;

class Solution {
public:
    string digitSum(string s, int k) {
        // Continue reducing the string while its length is strictly greater than k
        while (s.length() > k) {
            string next_s = "";
            
            // Step through the string in chunks of size k
            for (int i = 0; i < s.length(); i += k) {
                int current_sum = 0;
                
                // Sum the digits in the current chunk (handling the last chunk which may be smaller)
                for (int j = i; j < i + k && j < s.length(); ++j) {
                    current_sum += s[j] - '0';
                }
                
                // Convert the sum to a string and append it to our new string
                next_s += to_string(current_sum);
            }
            
            // Update s for the next round
            s = next_s;
        }
        
        return s;
    }
};