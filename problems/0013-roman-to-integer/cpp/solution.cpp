1class Solution {
2public:
3    int romanToInt(string s) {
4        // Map to store the integer values of Roman symbols
5        unordered_map<char, int> roman = {
6            {'I', 1},
7            {'V', 5},
8            {'X', 10},
9            {'L', 50},
10            {'C', 100},
11            {'D', 500},
12            {'M', 1000}
13        };
14        
15        int total = 0;
16        int n = s.length();
17        
18        for (int i = 0; i < n; i++) {
19            // If the current value is less than the next value, subtract it
20            if (i < n - 1 && roman[s[i]] < roman[s[i + 1]]) {
21                total -= roman[s[i]];
22            } 
23            // Otherwise, add it to the total
24            else {
25                total += roman[s[i]];
26            }
27        }
28        
29        return total;
30    }
31};
32