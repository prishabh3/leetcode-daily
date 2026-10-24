#include <string>
#include <vector>
#include <numeric>
#include <algorithm>

using namespace std;

class Solution {
private:
    // Days in each month for a non-leap year
    const vector<int> daysInMonths = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    // Helper function to convert "MM-DD" to a day number from 1 to 365
    int dateToDayOfYear(string date) {
        int month = stoi(date.substr(0, 2));
        int day = stoi(date.substr(3, 2));
        
        // Sum the days of all previous months
        int dayOfYear = 0;
        for (int i = 0; i < month - 1; ++i) {
            dayOfYear += daysInMonths[i];
        }
        
        // Add the days of the current month
        return dayOfYear + day;
    }

public:
    int countDaysTogether(string arriveAlice, string leaveAlice, string arriveBob, string leaveBob) {
        // Convert all dates to day-of-year integers
        int aliceStart = dateToDayOfYear(arriveAlice);
        int aliceEnd = dateToDayOfYear(leaveAlice);
        int bobStart = dateToDayOfYear(arriveBob);
        int bobEnd = dateToDayOfYear(leaveBob);
        
        // Find the latest arrival day and the earliest departure day
        int overlapStart = max(aliceStart, bobStart);
        int overlapEnd = min(aliceEnd, bobEnd);
        
        // If they overlap, the number of days is (end - start + 1)
        if (overlapStart <= overlapEnd) {
            return overlapEnd - overlapStart + 1;
        }
        
        // No overlap
        return 0;
    }
};
