# Changes

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
