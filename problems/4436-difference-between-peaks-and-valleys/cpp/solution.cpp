
class Solution {
public:
    int peakValleyDifference(vector<int>& nums) {
        int peakSum = 0;
        int valleySum = 0;

        for (int i = 1; i < nums.size() - 1; i++) {
            if (nums[i] > nums[i - 1] &&
                nums[i] > nums[i + 1]) {
                peakSum += nums[i];
            }
            else if (nums[i] < nums[i - 1] &&
                     nums[i] < nums[i + 1]) {
                valleySum += nums[i];
            }
        }

        return peakSum - valleySum;
    }
};
