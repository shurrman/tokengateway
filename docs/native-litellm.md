# Read-only ChatGPT quotas for an existing LiteLLM service

This mode runs the Bun dashboard without Docker, Kubernetes, the desktop app,
or the `sitecustomize.py` plugin. LiteLLM continues to serve its existing
`chatgpt/*` models through Responses API. TokenGateway only reads the native
LiteLLM auth file and requests account quota information from ChatGPT.

```text
Browser -- LAN + HTTP Basic --> TokenGateway 192.168.128.22:3737
                                           |
                                           +-- read-only LiteLLM auth.json
                                           +-- ChatGPT usage endpoint

Existing clients --> LiteLLM :4000 --> ChatGPT Responses API (unchanged)
```

The dashboard reads `access_token`, `expires_at` (epoch seconds), `account_id`
and optional token claims for display. It never returns raw credentials,
retains a refresh token, writes the auth file, refreshes OAuth, or starts a
login. Login/logout and credential APIs return 403 in this mode. JWT claims
are unverified display metadata, not an authorization mechanism.

The native format was checked against LiteLLM 1.100.1. The app does not read
Codex CLI's differently structured auth file. Use an explicit path to the
auth file of the intended LiteLLM instance; do not copy a refresh token into
TokenGateway. A separate OAuth session is unnecessary for this read-only mode.

## Install without Docker

Requirements: Bun 1.3.14 (the tested version), Linux/systemd for the sample
service, and an already configured LiteLLM `chatgpt/*` backend. No Python
plugin, extra database or Rust build is needed. The dashboard runtime imports
only Bun/Node built-ins; its npm dependencies are development types/tools.

Clone this fork and optionally run its tests:

```bash
git clone https://github.com/shurrman/tokengateway.git
cd tokengateway
cd dashboard
bun install --frozen-lockfile
bun test tests
bun run tsc --noEmit
cd ..
```

The service template assumes `/usr/bin/bun`, existing user/group `litellm`,
and `/var/lib/litellm/chatgpt/auth.json`. Adjust these paths to match your host.
Install a reviewed checkout (the commands below do not modify LiteLLM):

```bash
sudo install -d -m 0755 /opt/tokengateway-quota/dashboard/src
sudo install -m 0644 dashboard/server.ts /opt/tokengateway-quota/dashboard/
sudo install -m 0644 dashboard/src/*.ts /opt/tokengateway-quota/dashboard/src/
sudo install -d -m 0700 /etc/tokengateway
# First installation only; preserve an existing password on upgrades.
sudo openssl rand -hex -out /etc/tokengateway/dashboard-password 24
sudo chmod 0600 /etc/tokengateway/dashboard-password
sudo install -m 0644 deploy/systemd/tokengateway-quota.service /etc/systemd/system/
sudo systemd-analyze verify /etc/systemd/system/tokengateway-quota.service
sudo systemctl daemon-reload
sudo systemctl start tokengateway-quota
```

The dashboard runs as `litellm` to read the existing mode-0600 auth file.
`ProtectSystem=strict` and `ReadOnlyPaths` also make that file read-only in
the service's mount namespace. Do not make OAuth files world-readable.
The password is passed through systemd `LoadCredential`, not process argv.

For startup at boot after validation:

```bash
sudo systemctl enable tokengateway-quota
```

## Open the dashboard

Open `http://192.168.128.22:3737`, username `quota`. Read the generated password
on the server with `sudo cat /etc/tokengateway/dashboard-password`.

The user explicitly chose `0.0.0.0:3737` for access from the closed local
network; no SSH tunnel is needed. The local LiteLLM already listens on
`0.0.0.0:4000`. Browser/API authentication remains enabled.

## Quota and failure semantics

- Successful quota results are cached for five minutes. The UI shows the
  snapshot time; concurrent polls share one upstream request.
- The file is reread on each poll. A changed access token/account invalidates
  the cache. Restarting the panel is not required after LiteLLM refreshes OAuth.
- Failed quota requests retry after one minute. If a previous snapshot is
  shown, it stays marked cached and carries the current error.
- Expired credentials, unreadable files, HTTP 401/403 and missing quota windows
  render as errors, never as a healthy zero-percent quota. The panel cannot
  repair authentication; LiteLLM must refresh or reauthenticate itself.
- This shows subscription/account limits, not LiteLLM virtual-key spending,
  per-model allocations, or PostgreSQL usage logs. No generation request is
  issued by the dashboard.

## Verify and stop

The installed LiteLLM refresh implementation can be exercised without real
credentials or an external OAuth request:

```bash
LITELLM_TEST_PYTHON=/opt/litellm/venv/bin/python bun run scripts/test-litellm-rotation.ts
```

The test starts with a synthetic auth file, expires it, lets the installed
LiteLLM authenticator rotate it through an in-memory HTTP transport, and checks
that the same dashboard instance invalidates its quota cache. This verifies the
integration, not a live provider-issued rotation.

The local and production LiteLLM instances currently share the same OAuth
session (verified by token fingerprints on 2026-09-17). Their token expires on
2026-09-20 at 14:19:53 UTC. Do not force-refresh the local copy: first create an
independent login, or observe the next naturally occurring refresh of the
intended instance. Copying auth.json to another path does not isolate a session.

```bash
sudo systemctl status tokengateway-quota --no-pager
sudo journalctl -u tokengateway-quota -n 30 --no-pager
curl -i http://192.168.128.22:3737/api/status  # must return 401
curl --user quota http://192.168.128.22:3737/api/status  # prompts for password
curl --user quota http://192.168.128.22:3737/api/usage
curl --user quota -i http://192.168.128.22:3737/api/credentials  # must return 403
```

To stop the trial, `sudo systemctl stop tokengateway-quota`. If enabled, disable
it with `sudo systemctl disable tokengateway-quota`. LiteLLM needs no restart,
config rollback, or OAuth restoration because this integration does not modify it.

## Other deployment modes

All dashboard routes now require HTTP Basic authentication. Configure either
`DASHBOARD_PASSWORD_FILE` or `DASHBOARD_PASSWORD` (minimum 16 characters), with
optional `DASHBOARD_USERNAME` (default `quota`). File configuration takes
precedence. Compose passes the password from `.env`; Kubernetes expects a
`quota-dashboard-auth` Secret with a `password` key. Standalone container
deployments also need `HOST=0.0.0.0`. Existing desktop integrations need to send
the dashboard's Basic auth header; the desktop client is not adapted here.

Without `LITELLM_CHATGPT_AUTH_FILE`, the original managed-OAuth mode remains.
Its independent dashboard/plugin refresh owners and Kubernetes persistence
are not fixed by the read-only integration. Do not load the plugin into an
existing LiteLLM just to view quotas.
