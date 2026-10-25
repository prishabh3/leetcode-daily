# Contributing to LC-Sync

Thank you for your interest in contributing to LC-Sync! We welcome bug reports, feature suggestions, and code contributions.

---

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests in watch mode during development:
   ```bash
   npm run test:watch
   ```
4. Verify strict TypeScript checking:
   ```bash
   npm run typecheck
   ```
5. Build the extension:
   ```bash
   npm run build
   ```

---

## Coding Guidelines

- **TypeScript**: Strict mode is enabled. Avoid using `any` when explicit types can be modeled.
- **Local-first Architecture**: Never add external third-party servers, remote tracking scripts, or analytics backends.
- **Privacy & Security**: Never log secrets, auth tokens, or passwords. All error handlers must sanitize secrets.
- **Deterministic Generation**: All README, SVG, and index generation logic must be deterministic and reproducible.
- **Testing**: Write unit or integration tests for all new core logic and edge cases before submitting PRs.

---

## Pull Request Checklist

- [ ] All tests pass (`npm test`).
- [ ] TypeScript typecheck passes with zero errors (`npm run typecheck`).
- [ ] Build succeeds (`npm run build`).
- [ ] Documentation updated where relevant.
