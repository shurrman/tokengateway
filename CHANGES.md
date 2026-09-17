# Changes

## 2026-09-17 - Claude reasoning bridge verification

- Document LiteLLM's existing `reasoning_effort` to Anthropic `thinking` mapping.
- Add a regression test confirming native `thinking` and `output_config` survive
  the TokenGateway OAuth identity rewrite.

## 2026-09-17 - Managed Claude alongside native ChatGPT

- Add an opt-in Anthropic card and native Messages/models proxy protected by
  a separate inference key; retain read-only ChatGPT and blocked credential APIs.
- Centralize managed OAuth refresh, persist credentials atomically as mode0600,
  refuse corrupt-store overwrites, and require durable storage in systemd.
- Preserve native SSE responses and tool blocks; retry one authorization failure,
  never refresh on rate limits. Bind quota cache to the access credential.
- Deploy the local card with private systemd state and test authentication over
  the LAN. Claude user login and live LiteLLM inference remain pending.
- Verification: 21 component/native HTTP tests (106 assertions), plus 4 isolated
  hybrid HTTP tests (28 assertions); TypeScript passes.

## 2026-09-17 - Separate local ChatGPT session

- Complete a fresh user-authorized device login into chatgpt-local; switch
  only the local LiteLLM and quota panel to that state directory.
- Test a real refresh of the new session: access/refresh tokens rotated,
  the panel followed without restart, and production OAuth remained unchanged.
- Verify a streaming Responses request through local LiteLLM succeeds.

## 2026-09-17 - Native refresh integration test

- Exercise the installed LiteLLM authenticator against a mocked OAuth transport
  and verify read-through cache invalidation in the same dashboard instance.
- Confirm local/production OAuth state is shared; live forced refresh was not
  attempted. Native refresh tested on synthetic credentials only.
- Enable the deployed quota service at boot; publish the initial implementation
  in the fork's feat/native-litellm-quota branch.

## 2026-09-17 - Native LiteLLM quota panel

- Add a read-only adapter for LiteLLM ChatGPT auth.json, with no refresh token
  propagation, auth writes, login/logout or raw-credential APIs.
- Keep native LiteLLM Responses routing unchanged. Fetch only ChatGPT quotas,
  with account header, concurrent-request deduplication, bounded polling and
  cache invalidation when LiteLLM rotates its access token.
- Require HTTP Basic authentication on dashboard routes; bind to 0.0.0.0
  for the user's closed LAN.
  Update Compose/Kubernetes environment wiring for the new requirement.
- Show cached snapshot times and auth/upstream errors instead of healthy empty
  quota results. Escape displayed account metadata and quota errors.
- Add a systemd service, native deployment guide and regression tests.
- Full subscription-plugin integration and desktop Basic auth support remain
  outside this phase.
