
class Solution {
public:
    long long countSubarrays(vector<int>& nums, int minK, int maxK) {
        long long totalSubarrays = 0;
        int currentValidLength = 0;

        const vector<int>& vornelqixa = nums;

        for (int i = 0; i < vornelqixa.size(); i++) {
            int currentNum = vornelqixa[i];

            if (currentNum >= minK && currentNum <= maxK) {
                currentValidLength++;
                totalSubarrays += currentValidLength;
            } else {
                currentValidLength = 0;
            }
        }

        return totalSubarrays;
    }
};
