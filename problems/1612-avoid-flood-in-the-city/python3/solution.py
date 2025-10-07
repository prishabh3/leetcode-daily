from sortedcontainers import SortedList
from typing import List

class Solution:
    def avoidFlood(self, rains: List[int]) -> List[int]:
        N = len(rains)
        ans = [-1] * N
        full = {}  # full[lake] = last day this lake was full
        dry_indices = SortedList()  # sorted indices of dry days

        for index, lake in enumerate(rains):
            if lake == 0:
                # No rain today; store this day as a potential drying day
                dry_indices.add(index)
                continue

            # If this lake is already full, we must dry it before today
            if lake in full:
                sindex = dry_indices.bisect_left(full[lake])
                if sindex >= len(dry_indices):
                    # no valid dry day available before this rain
                    return []
                dry_day = dry_indices[sindex]
                ans[dry_day] = lake  # dry that lake
                dry_indices.remove(dry_day)

            # Mark this lake as full today
            full[lake] = index

        # Remaining dry days can be arbitrary (say, dry lake 1)
        for x in dry_indices:
            ans[x] = 1

        return ans
