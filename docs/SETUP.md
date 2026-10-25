# LC-Sync Setup & Installation Guide

This guide describes how to build, install, and configure LC-Sync on Google Chrome (or any Chromium-compatible browser such as Brave, Edge, or Arc).

---

## 1. Prerequisites

- **Node.js**: Version 18+ (tested on Node v23)
- **npm**: Version 9+
- **Google Chrome** (or Chromium-based browser)
- **GitHub Account**

---

## 2. Installation & Build

From the root of the `lc-sync` repository:

```bash
# 1. Install dependencies
npm install

# 2. Run test suite to verify system integrity
npm test

# 3. Type check
npm run typecheck

# 4. Build extension bundle
npm run build
```

Upon a successful build, the production extension bundle will be output to the `dist/` folder.

---

## 3. Loading the Extension in Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in the URL bar.
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker dialog, select the `dist/` directory inside your `lc-sync` repository:
   `/path/to/LC-Daily/dist`
6. Click **Select Folder**.
7. The extension card **LC-Sync: LeetCode & GitHub Sync** will appear. Pin the extension to your browser toolbar for quick access.

---

## 4. GitHub Configuration

To synchronize solutions to your personal repository, configure your GitHub authentication credentials.

### Step 4.1: Create a Destination Repository
1. On GitHub, create a new repository (e.g., `leetcode-daily`).
2. You may make it **Public** or **Private**.
3. You can initialize it with or without a README; LC-Sync can handle empty repositories automatically.

### Step 4.2: Generate a GitHub Personal Access Token (PAT)
For maximum security, use a **Fine-Grained Personal Access Token**:
1. On GitHub, go to **Settings** $\rightarrow$ **Developer Settings** $\rightarrow$ **Personal access tokens** $\rightarrow$ **Fine-grained tokens**.
2. Click **Generate new token**.
3. Name the token: `LC-Sync Extension`.
4. Expiration: Choose your preferred expiration period (e.g., 90 days or 1 year).
5. **Repository access**: Select **Only select repositories**, and select your solutions repository (e.g., `leetcode-daily`).
6. **Permissions**: Under **Repository permissions**, locate **Contents** and select **Access: Read and write**.
7. Click **Generate token** and copy the resulting string (`github_pat_...`).

### Step 4.3: Configure LC-Sync Settings
1. Click the **LC-Sync** toolbar icon, then click the **⚙️ Settings** icon (or right-click the extension icon $\rightarrow$ **Options**).
2. Paste your GitHub Token.
3. Enter your **GitHub Username / Owner** (e.g., `octocat`).
4. Enter your **Repository Name** (e.g., `leetcode-daily`).
5. Branch Name: `main` (or your preferred branch).
6. Directory Prefix: `problems` (or leave default).
7. Click **🔌 Test Connection & Access**.
8. Verify that the test reports: `✓ Successfully connected to octocat/leetcode-daily with write access.`
9. Click **Save Settings**.

---

## 5. Daily Usage Workflow

### Automatic Submission Detection:
1. Open any problem on LeetCode (e.g., `https://leetcode.com/problems/two-sum/`).
2. Write and submit your solution.
3. When the LeetCode evaluation finishes with **Accepted**, the floating LC-Sync pill will reflect: `Accepted! Ready to Sync`.
4. Click the pill or the LC-Sync extension popup to review your code, approach name, time complexity, and recall confidence.
5. Confirm to synchronize your solution to GitHub.

### Manual Import Workflow:
1. Open the LC-Sync Dashboard (`dashboard.html`) or Popup.
2. Click **Manual Solution Import**.
3. Paste the problem URL, code, language, and initial notes.
4. Click **Review Submission**, verify the preview and file path, and click **Confirm & Upload to GitHub**.

### Spaced Repetition Revision:
1. Open the **Dashboard** $\rightarrow$ **Daily Revision Queue**.
2. Problems due for review appear sorted by urgency.
3. Re-solve or mentally reproduce the approach, rate your recall confidence (1-5), and click **Complete Review**.
4. The system automatically recalculates and reschedules the next revision interval!
