# LC-Sync Security & Privacy Policy

## 1. Threat Model & Principles

LC-Sync is designed as a **local-first developer tool**. Security and credential protection are central design constraints:

1. **No External Backends or Middlemen**: LC-Sync has no proprietary cloud servers, databases, analytics trackers, or third-party proxy endpoints. All communication occurs strictly between your browser, LeetCode, and the official GitHub REST API (`https://api.github.com`).
2. **Zero Code Transmission to External AI Providers**: Your private code and notes remain under your full ownership and are never sent to external AI services or third parties.
3. **No Credential Harvesting**: LC-Sync never asks for, reads, or stores your LeetCode password, session tokens, or unrelated cookies.

---

## 2. GitHub Credential Storage & Handling

- **Storage Boundary**: Your GitHub Personal Access Token (PAT) is stored exclusively in `chrome.storage.local`.
- **Never Synced to Cloud**: LC-Sync explicitly avoids `chrome.storage.sync` to prevent credentials from being mirrored onto other machines or synced across Google profiles.
- **Masking in Logs & Exceptions**: All error handlers pass strings through `sanitizeErrorSecret()`, which strips GitHub classic tokens (`ghp_...`), fine-grained tokens (`github_pat_...`), and Bearer headers from error logs and diagnostic messages.
- **Principle of Least Privilege**: Users are advised to generate Fine-Grained Personal Access Tokens restricted solely to the target solutions repository with `Contents: Read & write` permissions.

---

## 3. Extension Permissions Audit

Manifest V3 permissions requested:

| Permission | Purpose |
| :--- | :--- |
| `storage` | Preserves local app settings, cached problem index, and sync queue offline. |
| `tabs` | Allows clicking extension actions to launch the local `dashboard.html` and `options.html` pages. |
| `action` | Displays submission badges ("Ready to Sync") on the toolbar icon. |
| `*://leetcode.com/*` | Observes the LeetCode DOM to detect newly accepted submissions. |
| `*://leetcode.cn/*` | Observes the LeetCode CN DOM for international users. |
| `https://api.github.com/*` | Directly pushes commits and files to the configured repository. |

No broad `<all_urls>` permission is requested.

---

## 4. Input Sanitization & Path Traversal Prevention

When constructing directory paths for repositories:
- Problem slugs and approach names pass through `sanitizeSlug()` (`src/core/sync/path-sanitizer.ts`), removing traversal tokens (`../`), slashes, and non-alphanumeric symbols.
- Problem IDs are padded to 4 digits or stripped of special characters.
- File extensions are strictly mapped via predefined language constants (`src/core/utils/languages.ts`), preventing execution of arbitrary extensions.

---

## 5. Reporting a Security Concern

If you discover a vulnerability or security bug, please open a private security advisory on GitHub or contact the repository maintainers.
