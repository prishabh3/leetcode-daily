class Solution {
public:
    vector<int> grayCode(int n) {
        vector<int> result;
        int totalNumbers = 1 << n; // 1 shifted left by n is 2^n
        
        for (int i = 0; i < totalNumbers; i++) {
            // The bitwise formula to generate the i-th Gray code
            result.push_back(i ^ (i >> 1));
        }
        
        return result;
    }
};