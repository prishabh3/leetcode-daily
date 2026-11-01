int minMoves(vector<int>& nums) {
        int min_val = nums[0];
        for (int num : nums) {
            if (num < min_val) {
                min_val = num;
            }
        }
        
        int moves = 0;
public:
class Solution {
using namespace std;

#include <algorithm>

#include <vector>