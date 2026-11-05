#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findTheDistanceValue(vector<int>& arr1, vector<int>& arr2, int d) {
        // Sort arr2 to enable binary search
        sort(arr2.begin(), arr2.end());
        
        int distanceValue = 0;
        
        for (int num : arr1) {
            // Find the first element in arr2 that is >= (num - d)
            auto it = lower_bound(arr2.begin(), arr2.end(), num - d);
            
            // Check if the found element is within the upper bound (num + d)
            if (it != arr2.end() && *it <= num + d) {
                // An element exists within the distance d, so we skip counting
                continue; 
            }
            
            // No element found in the range [num - d, num + d]
            distanceValue++;
        }
        
        return distanceValue;
    }
};