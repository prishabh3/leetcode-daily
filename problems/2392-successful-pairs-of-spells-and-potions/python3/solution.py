

class Solution:
    def successfulPairs(self, spells: List[int], potions: List[int], success: int) -> List[int]:
        potions.sort()
        P = len(potions)
        ans = []
        for s in spells:
            # Minimum potion value needed for success
            min_p = (success + s - 1) // s
            index = bisect.bisect_left(potions, min_p)
            ans.append(P - index)
        return ans
