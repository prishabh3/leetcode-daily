class Solution {
public:
    int minMoves(vector<int>& nums) {
        // Find the target maximum value
        int max_val = *max_element(nums.begin(), nums.end());
        
        int moves = 0;
        // Calculate the moves required for each element to reach the max value
        for (int num : nums) {
            moves += (max_val - num);
        }
        
        return moves;
    }
};