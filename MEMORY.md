# Project memory

## Scope and decisions

- Fork: shurrman/tokengateway, upstream baseline ef6916f541ed890b21629d90109bd3a45c114433.
- On 2026-09-17 cherry-picked 7 upstream commits (eduardopessin/tokengateway:
  a51def3, c9ddcdb, 5054af1, b4356af, 25c9de6, 4b17b2d, c250369) onto
  feat/native-litellm-quota; no conflicts, 26 plugin tests pass. Upstream is
  registered as git remote `upstream`; fetch to see new changes.
- .gitignore extended with `.venv` and `__pycache__/` (pytest venv).
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
- Auth input initially /var/lib/litellm/chatgpt/auth.json. After the separate
  user login on 2026-09-17 it is /var/lib/litellm/chatgpt-local/auth.json,
  still read-only in the dashboard's mount namespace.
- Dashboard username: quota. Password is generated in the root-only file
  /etc/tokengateway/dashboard-password and passed through LoadCredential.
  Do not copy its value or OAuth tokens into the repo, logs or agentmemory.
- Actual LAN-address checks: authenticated UI/status/usage HTTP 200,
  unauthenticated status HTTP 401, authenticated raw credentials HTTP 403.
- First live usage response returned a seven-day window at 24% used, without
  error. This is a point-in-time result, not a persistent quota value.
- During the initial quota-only phase LiteLLM was not restarted. It was later
  restarted to switch to the independent local session (see below).
- Verification: 12 Bun tests, 68 assertions, zero failures; TypeScript passed;
  embedded browser JavaScript parsed; systemd-analyze verify passed.

## Operational notes

- Managed Claude card/proxy deployed locally on 2026-09-17. Anthropic login
  remains pending; no Claude LiteLLM model has been added yet. Do not report
  end-to-end Claude success before live tests after login.
- Claude credentials belong to /var/lib/tokengateway-quota/credentials.json
  (systemd private StateDirectory). Separate inference key is loaded from
  /etc/tokengateway/anthropic-proxy-key; never print or commit it.
- Native ChatGPT remains read-only; dashboard password unchanged. LAN checks:
  combined status200, anonymous401, credentials403, Claude before login503.
- Pre-Claude runtime/unit backup: /var/backups/tokengateway-claude.16boxN.
- Installed LiteLLM main.py appends /v1/messages to Anthropic api_base; intended
  local base is http://127.0.0.1:3737/anthropic. Model ID must be verified after
  login rather than assumed from documentation or test fixtures.
- Claude verification: 21 tests/106 assertions plus 4 hybrid HTTP tests/28
  assertions; typecheck passed. Live inference and provider compatibility pending.

- Phase 2 (synthetic refresh integration test) committed/pushed as 34d3d79.
- User explicitly requested separation of local and working LiteLLM and
  completed a new device login on 2026-09-17. New state lives in
  /var/lib/litellm/chatgpt-local/auth.json, mode0600, directory0700 owned litellm.
  /etc/systemd/system/litellm.service.d/20-local-oauth.conf selects that path
  and UMask0077. The dashboard unit now reads the same new path read-only.
- Controlled LIVE refresh of the new independent session succeeded: both
  tokens changed; the same dashboard process picked up a new quota snapshot
  (25% weekly at that time), with no dashboard OAuth writes. Production .35
  auth-file checksum and the historical local shared auth file were unchanged.
  A streaming sol Responses call returned LOCAL_AUTH_OK. Session account IDs
  match, so quota is still shared at the ChatGPT account level.
- The shared-session warning below is historical and superseded for the new
  local path. Do not reactivate the historical shared session locally.

- Phase 1 committed as 57f40e0 and pushed to origin/feat/native-litellm-quota.
  HTTPS push had no credentials; the existing authenticated SSH identity is
  shurrman. Origin push URL now uses git@github.com:shurrman/tokengateway.git.
- Live read-only comparison on 2026-09-17 found identical access/refresh token
  fingerprints on .22 and production .35. Expiry: 2026-09-20T14:19:53Z.
  Do not force-refresh this shared session for a local test.
- scripts/test-litellm-rotation.ts exercises the installed LiteLLM 1.100.1
  authenticator against an in-memory OAuth transport with temporary synthetic
  tokens. Rotation/persistence and dashboard cache invalidation passed with
  the same dashboard instance and no dashboard writes. This synthetic phase
  preceded the successful separate login and live refresh described above.

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
