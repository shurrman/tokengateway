# Changes

## 2026-09-17 - Native Anthropic prompt-cache breakpoints

- Add two rolling `cache_control: ephemeral` breakpoints to the last cacheable
  conversation turns in the managed Anthropic proxy.
- Preserve existing client breakpoints, skip thinking blocks, avoid mutating
  the caller's request, and enforce Anthropic's four-breakpoint ceiling.
- Diagnose the prior zero cache usage end to end: production spend logs stored
  zero cache read/write tokens because the native TypeScript proxy sent zero
  `cache_control` markers; LiteLLM 1.100.1 already maps Anthropic cache usage
  into Responses `input_tokens_details` correctly.
- Deploy the proxy change to `litellm.wsoft`; live cache creation/read remains
  unverified while Anthropic returns HTTP 429 throttling errors.

## 2026-09-17 - Sync upstream tokengateway fixes

Cherry-picked 7 upstream commits from eduardopessin/tokengateway onto
feat/native-litellm-quota (no conflicts, plugin tests green):

- reasoning the subscriptions bill for (thinking/adaptive display fixes, drop
  redact-thinking beta for Anthropic) + contract tests
- close the OAuth parity gaps the wire disagreed with (adaptive default, model
  exclusion list)
- follow the tool tail with cache breakpoints (avoid re-reading 62-67% prompt)
- multimodal input + thinking-loop guard for Gemini
- pin deployment ids / drop models a subscription cannot serve (gpt-5.4)
- docs: reasoning visibility and /v1/responses route wiring

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
