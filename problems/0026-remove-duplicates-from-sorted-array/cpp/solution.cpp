class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        // An empty array has 0 unique elements
        if (nums.empty()) return 0;
        
        // k tracks the index where the next unique element should be placed
        int k = 1; 
        
        // Iterate through the array starting from the second element
        for (int i = 1; i < nums.size(); i++) {
            // If the current element is different from the previous unique element
            if (nums[i] != nums[k - 1]) {
                nums[k] = nums[i]; // Move it to the unique position
                k++;               // Increment the count of unique elements
            }
        }
        
        return k;
    }
};
