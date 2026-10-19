class Solution {
public:
    vector<int> targetIndices(vector<int>& nums, int target) {
        int smaller_count = 0;
        int target_count = 0;
        
        // Count frequencies of smaller numbers and target occurrences
        for (int num : nums) {
            if (num < target) {
                smaller_count++;
            } else if (num == target) {
                target_count++;
            }
        }
        
        // Generate the indices based on counts
        vector<int> result;
        for (int i = 0; i < target_count; ++i) {
            result.push_back(smaller_count + i);
        }
        
        return result;
    }
};
