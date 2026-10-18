class Solution {
public:
    int minDeletions(vector<int>& nums) {
        return nums.end() - unique(nums.begin(), nums.end());
    }
};
