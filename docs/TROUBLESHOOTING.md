# LC-Sync Troubleshooting & Diagnostic Guide

This document lists solutions for common setup issues, network edge cases, and GitHub synchronization errors.

---

## 1. GitHub Connection Issues

### "Authentication failed. Please verify your GitHub Personal Access Token."
- **Cause**: The token entered is invalid, has expired, or has had its permissions revoked.
- **Remedy**:
  1. Go to GitHub $\rightarrow$ **Settings** $\rightarrow$ **Developer Settings** $\rightarrow$ **Personal access tokens**.
  2. Confirm the token has not expired.
  3. Ensure the token has `Contents: Read and write` permissions for your target repository.
  4. Paste the new token in LC-Sync Settings and click **🔌 Test Connection & Access**.

### "You have read access to owner/repo, but not push (write) access."
- **Cause**: The token only has read permissions or the repository is owned by an organization requiring SSO authorization.
- **Remedy**:
  - For organization repositories, ensure the token is authorized for your organization's SAML/SSO.
  - Re-generate the token with `Contents: Read and write`.

### "Repository 'owner/repo' not found or token lacks access."
- **Cause**: The owner name or repository name is misspelled, or the fine-grained token was restricted to a different repository.
- **Remedy**:
  - Double-check that `owner` matches your GitHub username exactly.
  - Verify that the token's **Selected repositories** list includes the repository.

---

## 2. LeetCode Submission Detection

### "The extension did not detect my accepted submission automatically."
- **Cause**: LeetCode frequently updates its frontend DOM structure or CSS class names. Additionally, single-page application (SPA) routing can sometimes delay DOM updates.
- **Remedy**:
  1. Click the floating **LC-Sync Ready** badge in the bottom-right of the LeetCode screen.
  2. Use the **Manual Solution Import** option:
     - Open the extension popup or dashboard.
     - Paste your problem URL and accepted code.
     - Click **Review Submission** $\rightarrow$ **Confirm & Upload to GitHub**.
  3. Verify that the extension is active on `leetcode.com` by checking Chrome's extension puzzle piece icon.

### "Why is my submission detected with 'Unknown' difficulty or title?"
- **Remedy**: When importing manually, you can edit the difficulty (Easy, Medium, Hard) and problem title directly in the review panel before uploading.

---

## 3. GitHub Concurrency & Branch Conflicts

### "409 Conflict: Reference update failed (not a fast forward)"
- **Cause**: Another commit was pushed to your solutions repository concurrently while LC-Sync was creating a commit.
- **Remedy**: LC-Sync has built-in bounded retries with exponential backoff that automatically refetches the latest tree and retries up to 3 times. If this occurs, simply click **Retry** in the **Sync Queue** tab.

---

## 4. GitHub API Rate Limits

### "API rate limit exceeded for user"
- **Cause**: GitHub imposes rate limits on API requests (5,000 requests per hour for authenticated accounts).
- **Remedy**:
  - LC-Sync checks `x-ratelimit-remaining` headers and will pause requests until `x-ratelimit-reset`.
  - Check your remaining limit in GitHub Settings or wait until the reset window passes.

---

## 5. Local State & Cache Reset

If you ever wish to completely clear your local settings, cached problem index, and queue:
1. Open **Options / Settings** (`options.html`).
2. Scroll to the **Danger Zone**.
3. Click **Reset All Local Data** and confirm.
4. *Note*: This will not delete any files or commit history from your GitHub repository.
