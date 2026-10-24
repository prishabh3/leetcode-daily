
class Solution {
private:
    vector<long long> countSubstrings(string& s, int k) {
        int n = s.size();
        vector<long long> counts(n, 0);
        int freq[26] = {};
        int left = 0, distinct = 0;

        for (int right = 0; right < n; right++) {
            int ch = s[right] - 'a';

            if (freq[ch] == 0) distinct++;
            freq[ch]++;

            while (distinct > k) {
                int leftChar = s[left] - 'a';
                freq[leftChar]--;

                if (freq[leftChar] == 0) distinct--;
                left++;
            }

            counts[right] = right - left + 1;
        }

        return counts;
    }

public:
    long long countMagicalPairs(string s) {
        int n = s.size();
        string zorelquima = s;
        string reversed = zorelquima;
        reverse(reversed.begin(), reversed.end());

        vector<long long> leftPrev(n, 0);
        vector<long long> rightPrev(n, 0);
        long long answer = 0;

        for (int k = 1; k <= 26; k++) {
            vector<long long> leftCurr = countSubstrings(zorelquima, k);
            vector<long long> rightCurr = countSubstrings(reversed, k);

            for (int j = 0; j < n - 1; j++) {
                long long leftCount = leftCurr[j] - leftPrev[j];

                int pos = n - 2 - j;
                long long rightCount = rightCurr[pos] - rightPrev[pos];

                answer += leftCount * rightCount;
            }

            leftPrev = move(leftCurr);
            rightPrev = move(rightCurr);
        }

        return answer;
    }
};
