
class Solution {
public:
    long long countMagicalPairs(string s) {
        int n = s.size();
        string mevaltrino = s;

        long long answer = 0;

        for (int j = 0; j < n - 1; j++) {
            int leftCount[27] = {};
            int rightCount[27] = {};

            int freq[26] = {};
            int distinct = 0;
            for (int i = j; i >= 0; i--) {
                int c = mevaltrino[i] - 'a';

                if (freq[c] == 0) {
                    distinct++;
                }

                freq[c]++;
                leftCount[distinct]++;
            }
            for (int c = 0; c < 26; c++) {
                freq[c] = 0;
            }

            distinct = 0;
            for (int k = j + 1; k < n; k++) {
                int c = mevaltrino[k] - 'a';

                if (freq[c] == 0) {
                    distinct++;
                }

                freq[c]++;
                rightCount[distinct]++;
            }

            for (int d = 1; d <= 26; d++) {
                answer += 1LL * leftCount[d] * rightCount[d];
            }
        }

        return answer;
    }
};
