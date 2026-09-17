# Project memory

## Scope and decisions

- Fork: shurrman/tokengateway, upstream baseline ef6916f541ed890b21629d90109bd3a45c114433.
- Working branch: feat/native-litellm-quota. On 2026-09-17 the user authorized
  committing/pushing each phase, enabling autostart, testing token rotation,
  and then integrating Claude on the local LiteLLM.
- First stage selected by the user: quota panel for the existing local ChatGPT
  backend, not the full subscription plugin.
- Explicit user preference: bind services to 0.0.0.0 in this closed LAN.
  Keep the dashboard password and read-only OAuth integration.
- LiteLLM alone owns token refresh. Native quota mode rereads its auth file,
  discards refresh credentials, disables credential/login/logout APIs, and
  never imports the Python sitecustomize plugin.

## Local deployment verified 2026-09-17

- Host: 192.168.128.22. Local LiteLLM 1.100.1 listens on 0.0.0.0:4000.
- Production endpoint lightllm.wsoft leads through DEV to LXC 192.168.128.35;
  that production instance is outside this test deployment and was not changed.
- New tokengateway-quota.service runs as litellm, serving 0.0.0.0:3737.
  Active and enabled at boot after the user's approval on 2026-09-17.
- Installed runtime: /opt/tokengateway-quota/dashboard; Bun /usr/bin/bun (1.3.14).
- Auth input: /var/lib/litellm/chatgpt/auth.json, read-only in the service's
  mount namespace. Its initial hash and mtime remained unchanged after live
  status/quota requests, including the bind change/restart of the dashboard.
- Dashboard username: quota. Password is generated in the root-only file
  /etc/tokengateway/dashboard-password and passed through LoadCredential.
  Do not copy its value or OAuth tokens into the repo, logs or agentmemory.
- Actual LAN-address checks: authenticated UI/status/usage HTTP 200,
  unauthenticated status HTTP 401, authenticated raw credentials HTTP 403.
- First live usage response returned a seven-day window at 24% used, without
  error. This is a point-in-time result, not a persistent quota value.
- Local LiteLLM remained active with the same MainPID 1137. No LiteLLM config,
  routing, PostgreSQL data or auth state was modified for this integration.
- Verification: 12 Bun tests, 68 assertions, zero failures; TypeScript passed;
  embedded browser JavaScript parsed; systemd-analyze verify passed.

## Operational notes

- Phase 1 committed as 57f40e0 and pushed to origin/feat/native-litellm-quota.
  HTTPS push had no credentials; the existing authenticated SSH identity is
  shurrman. Origin push URL now uses git@github.com:shurrman/tokengateway.git.
- Live read-only comparison on 2026-09-17 found identical access/refresh token
  fingerprints on .22 and production .35. Expiry: 2026-09-20T14:19:53Z.
  Do not force-refresh this shared session for a local test.
- scripts/test-litellm-rotation.ts exercises the installed LiteLLM 1.100.1
  authenticator against an in-memory OAuth transport with temporary synthetic
  tokens. Rotation/persistence and dashboard cache invalidation passed with
  the same dashboard instance and no dashboard writes. Real provider rotation
  remains untested; it needs an independent login or observation after expiry.

- Open http://192.168.128.22:3737 directly from the LAN. For access details,
  installation, polling/error behavior and stop commands see docs/native-litellm.md.
- The panel caches successful quotas for five minutes, backs off failures for
  one minute and invalidates the cache when LiteLLM changes access token/account.
- Expired tokens and upstream rejections are displayed as errors. The panel
  deliberately cannot fix them by refreshing or starting a new OAuth session.
- Automatic tests use synthetic credentials and a loopback HTTP listener.
- Existing managed-OAuth/plugin refresh races and Kubernetes-only plugin
  persistence remain upstream limitations. The desktop client does not yet
  send the new Basic auth header. None is needed for the read-only quota mode.
- Filesystem tools may fail on this host with bwrap RTM_NEWADDR. Approved
  require_escalated exec works. For patches, an approved `env apply_patch`
  invocation works where exec's automatic apply_patch dispatch still fails.
