# Git Workflow & Commit Guidelines

Universal Git rules and branching guidelines applicable across all repositories and tech stacks.

## 1. Conventional Commits Standard

All commit messages MUST strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional scope>): <short imperative description>

[optional body explaining motivation / context]

[optional footer(s) such as Closes #123, BREAKING CHANGE: ...]
```

### Allowed Types:
- `feat`: A new feature or capability for the user.
- `fix`: A bug fix.
- `refactor`: Code changes that neither fix a bug nor add a feature (structural cleanup).
- `docs`: Documentation updates only.
- `style`: Code style/formatting changes that do not affect code execution (white-space, formatting, semicolons).
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Maintenance tasks, dependency bumps, build configurations, or tooling changes.
- `perf`: Performance improvements.
- `ci`: CI/CD configuration files and scripts.

### Rules for Commit Titles:
- Use lowercase imperative mood: `feat(auth): add biometric login support` (NOT `Added biometric login` or `Adds biometric`).
- Do not end the commit message title with a period.
- Maximum 72 characters for the title line.

## 2. Branching & Merging Strategy

- **Feature Branches**: Branch off the default development branch (e.g. `main` or `develop`).
  - Branch naming convention: `feat/<short-description>`, `fix/<ticket-id>-<description>`, `refactor/<description>`.
- **Atomic Commits**: Keep commits focused and atomic. Avoid large multi-purpose commits.
- **Clean History**: Rebase against the target branch before opening or finalizing Pull Requests to avoid unnecessary merge bubbles.

## 3. Pull Request Requirements

- Always provide a concise summary of changes, motivation, and verification steps in the PR description.
- Ensure all CI tests, linters, and type checkers pass prior to requesting review.
- Never commit secrets, API keys, private credentials, or unencrypted `.env` files.
