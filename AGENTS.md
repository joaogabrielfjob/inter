## Agent skills

## Commit messages

Use Conventional Commits: `type(optional-scope): concise imperative description`.

- Use the established types such as `feat`, `fix`, `test`, and `chore`.
- Add a scope only when the change is confined to one component (for example, `web`, `server`, or `scrap`); omit it for cross-component changes.
- Keep the description lowercase and do not end it with punctuation.

## Handoffs and commits

After completing an implementation, report in chat that it is ready for the user's review and testing. Do not create a commit unless the user explicitly asks for one.

### Issue tracker

Issues live as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The default five canonical triage labels are used. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses the single-context layout. See `docs/agents/domain.md`.
