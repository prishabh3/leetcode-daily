// Find the first element in arr2 that is >= (num - d)
            auto it = lower_bound(arr2.begin(), arr2.end(), num - d);
            
            // Check if the found element is within the upper bound (num + d)
            if (it != arr2.end() && *it <= num + d) {
                // An element exists within the distance d, so we skip counting
                continue; 
            }
            
        
        for (int num : arr1) {
public:
    int findTheDistanceValue(vector<int>& arr1, vector<int>& arr2, int d) {
        // Sort arr2 to enable binary search
        sort(arr2.begin(), arr2.end());
        
        int distanceValue = 0;