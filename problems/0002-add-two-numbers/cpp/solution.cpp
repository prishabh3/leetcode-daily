// DO NOT redefine struct ListNode — LeetCode provides it
struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    struct ListNode dummy;
    dummy.next = NULL;
    struct ListNode* curr = &dummy;
    int carry = 0;

    while (l1 || l2 || carry) {
        int val1 = l1 ? l1->val : 0;
        int val2 = l2 ? l2->val : 0;

        int total = val1 + val2 + carry;
        carry     = total / 10;
        int digit = total % 10;

        curr->next = (struct ListNode*)malloc(sizeof(struct ListNode));
        curr->next->val  = digit;
        curr->next->next = NULL;
        curr = curr->next;

        if (l1) l1 = l1->next;
        if (l2) l2 = l2->next;
    }

    return dummy.next;
}