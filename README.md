# ⚡ LC-Sync: Personal DSA Learning & GitHub Automation Platform

[![CI Tests](https://img.shields.io/badge/tests-35%20passed-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)]()
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-orange.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **LC-Sync** is a privacy-conscious, local-first Chrome extension and developer learning platform that synchronizes LeetCode solutions directly to your personal GitHub repository, maintains a structured learning journal, and powers an offline spaced repetition revision engine.

---

## 🌟 Why LC-Sync?

Most LeetCode sync tools merely dump code into a GitHub repository without helping you learn. **LC-Sync** is built on the philosophy:

> **Do not merely archive code. Help the user organize, understand, revise, and improve their problem-solving skills.**

### Key Capabilities:
- 🚀 **Reliable Submission Sync**: Automatic acceptance detection from LeetCode DOM with a 45-second submission window filter (no false-positive synchronizations when merely viewing solved problems).
- 📥 **Full Manual Import Workflow**: Robust manual fallback to import, edit, and review solutions with live duplicate warnings even if the website DOM changes.
- 🔒 **Local-First & Secure**: No intermediary backend, no third-party telemetry, and no external AI transmission. Tokens are kept strictly in `chrome.storage.local` and masked in all logs and errors.
- 📦 **Atomic Multi-File Commits**: Uses the GitHub Git Database API (`blobs` $\rightarrow$ `tree` $\rightarrow$ `commit` $\rightarrow$ `refs`) to update your solution file, `metadata.json`, `notes.md`, `sync-index.json`, `README.md`, and `assets/progress.svg` in a single atomic Git commit.
- 🧠 **Spaced Repetition Engine**: Calculates intelligent revision dates based on recall confidence (1-5) and recall lapses ($1 \rightarrow 3 \rightarrow 7 \rightarrow 14 \rightarrow 30$ days with multipliers), surfacing an urgent Daily Review Queue.
- 📝 **Structured 8-Section Journal**: Structured note-taking covering Intuition, Key Observation, Algorithm, Correctness Proof, Complexity Analysis, Edge Cases, Mistakes, and Simplified Explanation.
- 🔀 **Solution Evolution**: Track multiple approaches (e.g. Brute Force $O(N^2)$ vs Hash Map $O(N)$) and multiple languages under the same problem folder without overwriting existing solutions.
- 📊 **Deterministic Progress Dashboard**: Activity heatmap, difficulty breakdown (Easy/Medium/Hard), language distribution, and a clean SVG progress card generator.
- 🛡️ **Markdown Section Preservation**: Deterministically regenerates repository statistics while strictly preserving your custom notes and roadmaps outside `<!-- lc-sync:start -->` and `<!-- lc-sync:end -->`.

---

## 📂 Deliverables Architecture

LC-Sync consists of two interrelated components:

### 1. LC-Sync Software Repository (This Project)
Contains the Chrome Extension source code, build toolchain, testing suite, and documentation:
```text
lc-sync/
├── src/
│   ├── background/         # Chrome MV3 Service Worker
│   ├── content/            # LeetCode DOM Observer & Extractor
│   ├── core/
│   │   ├── generator/      # README, SVG, and Notes formatters
│   │   ├── github/         # GitHub API client & atomic Git DB operations
│   │   ├── revision/       # Spaced repetition revision engine
│   │   ├── storage/        # Type-safe storage wrapper & migrations
│   │   ├── sync/           # Queue manager, deduplication & path sanitizers
│   │   ├── types/          # Strict TypeScript interfaces
│   │   └── utils/          # URL parser, crypto, and language normalization
│   └── ui/
│       ├── common/         # Developer tokens and theme CSS
│       ├── dashboard/      # Full-page learning journal & revision dashboard
│       ├── options/        # GitHub configuration & connection tester
│       └── popup/          # Compact extension toolbar popup
├── tests/                  # 10 test suites covering 35 vitest cases
├── docs/                   # Architecture, Setup, Security & Troubleshooting
└── examples/               # Reference model of user's solutions repository
```

### 2. User Solutions Destination Repository Model
What LC-Sync produces in the user's personal GitHub repository:
```text
leetcode-daily/
├── README.md                # Progress dashboard & browsable solution directory
├── problems/
│   ├── 0001-two-sum/
│   │   ├── metadata.json    # Problem metadata, review dates & stats
│   │   ├── notes.md         # 8-section learning journal
│   │   └── cpp/
│   │       └── hash-map-optimal.cpp
│   └── 0003-longest-substring-without-repeating-characters/
│       ├── metadata.json
│       ├── notes.md
│       └── python3/
│           └── sliding-window.py
├── data/
│   └── sync-index.json      # Durable sync index and deduplication records
└── assets/
    └── progress.svg         # Deterministic SVG progress summary
```

---

## 🚀 Quick Start & Development

### 1. Install & Build
```bash
# Clone the repository
git clone https://github.com/your-username/lc-sync.git
cd lc-sync

# Install dependencies
npm install

# Run the test suite
npm test

# Verify type safety
npm run typecheck

# Build the production extension
npm run build
```

### 2. Load into Google Chrome
1. Navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** (top left).
4. Select the `dist/` directory generated by `npm run build`.

For full step-by-step setup and GitHub token instructions, see [`docs/SETUP.md`](./docs/SETUP.md).

---

## 🧪 Automated Testing Suite

LC-Sync includes 10 comprehensive Vitest suites with 35 test cases:

| Suite | Feature Tested |
| :--- | :--- |
| `tests/url-parser.test.ts` | Problem URL, slug, title, and submission ID extraction |
| `tests/languages.test.ts` | Language normalization (C++, Python 3, Java, JS, TS, C#) |
| `tests/path-sanitizer.test.ts` | ID zero-padding, slug sanitization, path traversal prevention |
| `tests/crypto.test.ts` | Deterministic SHA-256 hash generation and code normalization |
| `tests/deduplication.test.ts` | Primary ID & secondary content-hash deduplication |
| `tests/revision-scheduler.test.ts`| Spaced repetition intervals, urgency groups & queue sorting |
| `tests/readme-generator.test.ts` | Deterministic README table formatting & section preservation |
| `tests/sync-queue.test.ts` | Queue transitions (`Pending` $\rightarrow$ `Syncing` $\rightarrow$ `Synced`/`Failed`) |
| `tests/github-client.test.ts` | Auth failures, secret masking, rate limits, 409 conflict retries |
| `tests/schema-migration.test.ts`| Schema versioning, validation, and v1 $\rightarrow$ v2 migrations |

Run all tests:
```bash
npm test
```

---

## 🔒 Security & Privacy

- **No Remote Code Execution**: Complies strictly with Chrome Manifest V3 policy.
- **Credential Isolation**: GitHub tokens are stored solely in `chrome.storage.local` and never synced via Chrome sync or logged.
- **Secret Redaction**: Errors automatically sanitize tokens matching `ghp_...` and `github_pat_...`.
- **Path Traversal Guards**: Problem slugs and approach names are strictly filtered to alphanumeric characters and hyphens.

For more details, see [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## 📚 Documentation Directory

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Technical design, state machines, and data flow.
- [`docs/SETUP.md`](./docs/SETUP.md) — Step-by-step setup, extension loading, and token configuration.
- [`docs/SECURITY.md`](./docs/SECURITY.md) — Threat model, permissions audit, and secret handling.
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) — Solutions for common connection and sync issues.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Guidelines for contributing code.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
# leetcode-daily
