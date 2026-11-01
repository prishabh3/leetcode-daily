#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minMoves(vector<int>& nums) {
        int min_val = nums[0];
        for (int num : nums) {
            if (num < min_val) {
                min_val = num;
            }
        }
        
        int moves = 0;
        for (int num : nums) {
            moves += (num - min_val); // Accumulate the difference
        }
        
        return moves;
    }
};