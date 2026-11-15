#include <vector>

using namespace std;

class Solution {
public:
    int numOfSubarrays(vector<int>& arr) {
        int MOD = 1e9 + 7;
        
        int even_count = 1; // Base case: prefix sum of 0 before starting is even
        int odd_count = 0;
        int current_sum = 0;
        long long total_odd_subarrays = 0;
        
        for (int num : arr) {
            current_sum += num;
            
            if (current_sum % 2 == 0) {
                // Current sum is even. Add the number of previous odd prefix sums.
                total_odd_subarrays = (total_odd_subarrays + odd_count) % MOD;
                even_count++;
            } else {
                // Current sum is odd. Add the number of previous even prefix sums.
                total_odd_subarrays = (total_odd_subarrays + even_count) % MOD;
                odd_count++;
            }
        }
        
        return total_odd_subarrays;
    }
};