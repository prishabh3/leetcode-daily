#include <vector>
#include <algorithm>
#include <cmath>

using namespace std;

class Solution {
public:
    int minMoves2(vector<int>& nums) {
        int n = nums.size();
        
        // Find the median in O(n) average time
        nth_element(nums.begin(), nums.begin() + n / 2, nums.end());
        int median = nums[n / 2];
        
        int moves = 0;
        for (int num : nums) {
            moves += abs(num - median);
        }
        
        return moves;
    }
};