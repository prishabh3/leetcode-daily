class Solution {
public:
    int minSelection(vector<vector<int>>& availableIntervals, vector<vector<int>>& targetIntervals) {
        sort(targetIntervals.begin(), targetIntervals.end());
        vector<vector<int>> targets;
        for (const auto& t : targetIntervals) {
            if (targets.empty() || targets.back()[1] < t[0]) {
                targets.push_back(t);
            } else {
                targets.back()[1] = max(targets.back()[1], t[1]);
            }
        }

        sort(availableIntervals.begin(), availableIntervals.end());

        int nAvail = availableIntervals.size();
        int availIdx = 0;
        int count = 0;
        long long coveredUntil = -1;

        for (const auto& target : targets) {
            long long L = target[0];
            long long R = target[1];

            if (coveredUntil >= R) {
                continue;
            }

            long long cur = (coveredUntil < L) ? L : coveredUntil;

            while (coveredUntil < R) {
                long long bestEnd = -1;

                while (availIdx < nAvail && availableIntervals[availIdx][0] <= cur) {
                    bestEnd = max(bestEnd, (long long)availableIntervals[availIdx][1]);
                    availIdx++;
                }

                if (bestEnd <= coveredUntil) {
                    return -1;
                }

                count++;
                coveredUntil = bestEnd;
                cur = bestEnd;
            }
        }

        return count;
    }
};
