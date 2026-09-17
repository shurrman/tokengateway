# Working on this fork

- Read MEMORY.md for the intended test environment and completed verification.
- The first integration is a read-only quota panel for an existing local
  LiteLLM ChatGPT backend. LiteLLM alone owns refresh and persistence.
- Bind project services to 0.0.0.0 in this user's closed LAN, as explicitly
  requested. The quota panel still requires its dashboard password.
- Never copy live refresh tokens into tests, logs, fixtures, this repository,
  or the dashboard's managed credential store.
- Do not load sitecustomize.py or change LiteLLM routing for quota-panel work.
- Verify dashboard changes with `cd dashboard && bun test tests` and
  `bun run tsc --noEmit`; use synthetic tokens in automated tests.
- Preserve useful upstream behavior outside the task. Document compatibility
  changes in README.md, CHANGES.md and the native deployment guide.
- After code/documentation changes, run `graphify update .` and update
  agentmemory. Do not commit or push without the user's request.
