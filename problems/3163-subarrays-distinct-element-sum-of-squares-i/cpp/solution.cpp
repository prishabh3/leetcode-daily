class Solution {
public:
    int sumCounts(vector<int>& nums) {
        int n = nums.size();
        int totalSum = 0;

        // Iterate through all possible starting positions i
        for (int i = 0; i < n; ++i) {
            unordered_set<int> distinctElements;
            
            // Expand the subarray from i to j
            for (int j = i; j < n; ++j) {
                distinctElements.insert(nums[j]);
                int distinctCount = distinctElements.size();
                
                // Add the square of the distinct count
                totalSum += distinctCount * distinctCount;
            }
        }

        return totalSum;
    }
};
