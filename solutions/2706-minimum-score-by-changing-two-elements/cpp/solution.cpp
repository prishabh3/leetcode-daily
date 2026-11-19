#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minimizeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        
        // Evaluate the three possible ways to shrink the range by changing 2 elements
        int dropTwoSmallest = nums[n - 1] - nums[2];
        int dropTwoLargest  = nums[n - 3] - nums[0];
        int dropBothEnds    = nums[n - 2] - nums[1];
        
        return min({dropTwoSmallest, dropTwoLargest, dropBothEnds});
    }
};