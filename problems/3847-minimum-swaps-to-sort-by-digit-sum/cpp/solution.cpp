class Solution {
private:
    // Helper function to calculate the sum of digits of a number
    int getDigitSum(int n) {
        int sum = 0;
        while (n > 0) {
            sum += n % 10;
            n /= 10;
        }
        return sum;
    }

public:
    int minSwaps(vector<int>& nums) {
        int n = nums.size();
        
        // Store pair of {value, original_index}
        vector<pair<int, int>> arr(n);
        for (int i = 0; i < n; i++) {
            arr[i] = {nums[i], i};
        }

        // Precompute digit sums to avoid redundant calculations during sorting
        vector<int> digitSums(n);
        for (int i = 0; i < n; i++) {
            digitSums[i] = getDigitSum(nums[i]);
        }

        // Sort based on custom criteria
        sort(arr.begin(), arr.end(), [&](const pair<int, int>& a, const pair<int, int>& b) {
            int sumA = digitSums[a.second];
            int sumB = digitSums[b.second];
            if (sumA != sumB) {
                return sumA < sumB; // Primary: Increasing order of digit sum
            }
            return a.first < b.first; // Secondary: Increasing order of value
        });

        // Track visited elements to find graph cycles
        vector<bool> visited(n, false);
        int totalSwaps = 0;

        for (int i = 0; i < n; i++) {
            // If element is already visited or already in the correct position
            if (visited[i] || arr[i].second == i) {
                continue;
            }

            // Calculate the cycle size
            int cycleSize = 0;
            int j = i;
            while (!visited[j]) {
                visited[j] = true;
                j = arr[j].second; // Move to the next node in the cycle
                cycleSize++;
            }

            // Update total swaps required for this cycle
            if (cycleSize > 1) {
                totalSwaps += (cycleSize - 1);
            }
        }

        return totalSwaps;
    }
};
