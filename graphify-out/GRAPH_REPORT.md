# Graph Report - tokengateway  (2026-09-17)

## Corpus Check
- 50 files · ~95,243 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 695 nodes · 1206 edges · 64 communities (61 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d44d47f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- usage.ts
- _wrapped_acompletion
- PermissionEntry
- oauth.rs
- definitions
- permissions
- definitions
- urls
- ⚡ TokenGateway
- compilerOptions
- package.json
- main.ts
- test_bridge_spend_logging.py
- Building from Source
- test_usage_parity.py
- Project memory
- refresh_fixture.py
- server.test.ts
- Changes
- AGENTS.md
- server.ts
- sitecustomize.py
- providers.ts
- oauth.ts
- store.ts
- webviews
- properties
- CapabilityRemote
- Development Setup
- Anthropic Claude Max OAuth Setup Guide
- Read-only ChatGPT quotas for an existing LiteLLM service
- LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible)
- Capability
- desktop-schema.json
- Google Antigravity (Cloud Code API) Setup Guide
- README.md
- ShellScopeEntryAllowedArgs
- local
- identifier
- test_responses_route.py
- test_multimodal_loop.py
- _messages_to_antigravity_payload
- Exception
- test_parity_batch.py
- permissions
- 3. LiteLLM Wire Bridge (`sitecustomize.py`)
- isRecord
- _apply_conversation_cache
- properties
- _stream_antigravity_once
- _BridgeStreamWrapper
- Capability
- CapabilityRemote
- _read_tokens
- windows-schema.json
- _antigravity_open
- 📸 Screenshots
- local
- 🖥️ Why is Quota Desktop Needed? (The Localhost Port Binding Constraint)
- Target

## God Nodes (most connected - your core abstractions)
1. `isRecord()` - 25 edges
2. `loadCredentials()` - 19 edges
3. `_wrapped_acompletion()` - 19 edges
4. `_wrapped_router_acompletion()` - 18 edges
5. `readString()` - 16 edges
6. `OAuthState` - 16 edges
7. `_stream_antigravity_once()` - 16 edges
8. `_stream_codex_generator()` - 14 edges
9. `_wrapped_completion()` - 14 edges
10. `⚡ TokenGateway` - 14 edges

## Surprising Connections (you probably didn't know these)
- `load_plugin()` --references--> `module`  [EXTRACTED]
  litellm-plugin/test_cache_anchor.py → dashboard/tsconfig.json
- `run()` --calls--> `start_listeners()`  [INFERRED]
  desktop/src-tauri/src/lib.rs → desktop/src-tauri/src/oauth.rs
- `_stream_codex_generator()` --calls--> `Delta`  [INFERRED]
  litellm-plugin/sitecustomize.py → litellm-plugin/test_responses_route.py
- `_stream_codex_generator()` --calls--> `ModelResponseStream`  [INFERRED]
  litellm-plugin/sitecustomize.py → litellm-plugin/test_responses_route.py
- `_stream_codex_generator()` --calls--> `StreamingChoices`  [INFERRED]
  litellm-plugin/sitecustomize.py → litellm-plugin/test_responses_route.py

## Import Cycles
- None detected.

## Communities (64 total, 3 thin omitted)

### Community 0 - "usage.ts"
Cohesion: 0.11
Nodes (29): readNumber(), readTimestampMs(), isDefinitiveOAuthFailure(), AgentItem, ANTHROPIC_KIND_LABELS, clusterStats(), codexRateLimitBlock(), codexWindow() (+21 more)

### Community 1 - "_wrapped_acompletion"
Cohesion: 0.17
Nodes (20): _attach_codex_quota(), _bridge_message(), _bridge_stream_result(), _codex_finish_reason(), _emit_bridge_success(), _inject_claude_prompt(), _is_codex_model(), _is_gemini_model() (+12 more)

### Community 2 - "PermissionEntry"
Cohesion: 0.67
Nodes (3): PermissionEntry, anyOf, description

### Community 3 - "oauth.rs"
Cohesion: 0.13
Nodes (42): Client, get_cluster_usage(), get_status(), open_browser(), open_url(), paste_redirect(), AppHandle, Arc (+34 more)

### Community 4 - "definitions"
Cohesion: 0.13
Nodes (15): definitions, Identifier, Number, PermissionEntry, ShellScopeEntryAllowedArg, Value, oneOf, anyOf (+7 more)

### Community 5 - "permissions"
Cohesion: 0.17
Nodes (12): $ref, array, null, description, items, type, uniqueItems, description (+4 more)

### Community 6 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, Number, ShellScopeEntryAllowedArg, ShellScopeEntryAllowedArgs, Target, Value, anyOf, description (+8 more)

### Community 7 - "urls"
Cohesion: 0.15
Nodes (13): type, urls, webviews, windows, description, items, type, description (+5 more)

### Community 8 - "⚡ TokenGateway"
Cohesion: 0.17
Nodes (12): 🏗️ Architecture, 🤝 Contributing, 📖 Documentation, Existing LiteLLM without Docker, ✨ Features, ⚠️ Known Security Issues, 📄 License, 🚀 Quick Start (Docker Compose) (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (28): compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, skipLibCheck, strict (+20 more)

### Community 10 - "package.json"
Cohesion: 0.20
Nodes (9): dependencies, @types/bun, description, devDependencies, typescript, name, version, @types/bun (+1 more)

### Community 11 - "main.ts"
Cohesion: 0.22
Nodes (6): OAuthSuccessPayload, ProviderStatus, TauriEvent, TauriInvoke, Window, WindowTauri

### Community 12 - "test_bridge_spend_logging.py"
Cohesion: 0.28
Nodes (5): FakeLitellm, FakeLogging, gen_chunks(), main(), Bridge-served responses must still produce exactly one spend-log record. The…

### Community 13 - "Building from Source"
Cohesion: 0.29
Nodes (6): Building from Source, Development Mode, Prerequisites, Production Build, Quota Desktop — Local OAuth Loopback Bridge, Why is a Desktop Client Required?

### Community 14 - "test_usage_parity.py"
Cohesion: 0.33
Nodes (3): Details, FakeUsage, Usage normalisation must match @oh-my-pi/pi-ai, including cache accounting.…

### Community 15 - "Project memory"
Cohesion: 0.33
Nodes (5): Local deployment verified 2026-09-17, Managed Claude prompt caching (2026-09-17), Operational notes, Project memory, Scope and decisions

### Community 17 - "server.test.ts"
Cohesion: 0.50
Nodes (3): headers, names, priorEnv

### Community 18 - "Changes"
Cohesion: 0.22
Nodes (8): 2026-09-17 - Claude reasoning bridge verification, 2026-09-17 - Managed Claude alongside native ChatGPT, 2026-09-17 - Native Anthropic prompt-cache breakpoints, 2026-09-17 - Native LiteLLM quota panel, 2026-09-17 - Native refresh integration test, 2026-09-17 - Separate local ChatGPT session, 2026-09-17 - Sync upstream tokengateway fixes, Changes

### Community 24 - "server.ts"
Cohesion: 0.16
Nodes (15): dashboardApi(), handleApi(), logins, LoginState, PORT, server, dashboardAuth(), beginLogin() (+7 more)

### Community 25 - "sitecustomize.py"
Cohesion: 0.08
Nodes (31): CustomLogger, AnthropicCacheHandler, _antigravity_base_family(), _codex_file_part(), _codex_image_part(), _codex_prompt_cache_key(), _codex_quota_headers(), _codex_request_body() (+23 more)

### Community 26 - "providers.ts"
Cohesion: 0.11
Nodes (18): claims(), LiteLLMCredential, liteLLMQuotaApi(), readLiteLLMCredential(), ANTHROPIC_SCOPES, ANTHROPIC_USAGE_URL, ANTIGRAVITY_ENDPOINT, ANTIGRAVITY_USER_AGENT (+10 more)

### Community 27 - "oauth.ts"
Cohesion: 0.26
Nodes (13): readString(), discoverAntigravityProject(), exchangeCode(), parseTokenResponse(), pending, PendingLogin, readIdTokenClaims(), refreshing (+5 more)

### Community 28 - "store.ts"
Cohesion: 0.25
Nodes (12): refreshSweep(), atomicWriteJson(), isProviderId(), applyOverlay(), CredentialMap, deleteCredential(), loadCredentials(), mutate() (+4 more)

### Community 29 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 30 - "properties"
Cohesion: 0.15
Nodes (13): properties, Identifier, default, description, type, description, oneOf, type (+5 more)

### Community 31 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 32 - "Development Setup"
Cohesion: 0.29
Nodes (6): 1. Dashboard (Bun / TypeScript), 2. Quota Desktop (Tauri v2 / Rust + Vite), 3. LiteLLM Gateway & Plugin, Contributing to LLM Quota Dashboard & Gateway, Development Setup, Pull Request Guidelines

### Community 33 - "Anthropic Claude Max OAuth Setup Guide"
Cohesion: 0.40
Nodes (4): Anthropic Claude Max OAuth Setup Guide, Authentication via Quota Desktop, How it works, Manual Authentication via Terminal (Oh My Pi / OMP)

### Community 34 - "Read-only ChatGPT quotas for an existing LiteLLM service"
Cohesion: 0.29
Nodes (7): Install without Docker, Managed Claude (optional, experimental), Open the dashboard, Other deployment modes, Quota and failure semantics, Read-only ChatGPT quotas for an existing LiteLLM service, Verify and stop

### Community 35 - "LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible)"
Cohesion: 0.29
Nodes (6): Credits & References, In Docker / Docker Compose, In Kubernetes, Installation, LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible), What it does

### Community 36 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 37 - "desktop-schema.json"
Cohesion: 0.40
Nodes (4): anyOf, description, $schema, title

### Community 38 - "Google Antigravity (Cloud Code API) Setup Guide"
Cohesion: 0.40
Nodes (5): Authentication via Quota Desktop, Google Antigravity (Cloud Code API) Setup Guide, How it works, Multimodal Input, Supported Models in LiteLLM

### Community 39 - "README.md"
Cohesion: 0.25
Nodes (4): Authentication via Quota Desktop, How it works, OpenAI ChatGPT Plus / Codex Responses API Setup Guide, Supported Models in LiteLLM

### Community 40 - "ShellScopeEntryAllowedArgs"
Cohesion: 0.67
Nodes (3): ShellScopeEntryAllowedArgs, anyOf, description

### Community 41 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 42 - "identifier"
Cohesion: 0.67
Nodes (3): description, type, identifier

### Community 43 - "test_responses_route.py"
Cohesion: 0.13
Nodes (13): _bridge_usage(), _google_usage(), omp-google-shared.ts: promptTokenCount *includes* cached tokens, so it is…, Final stream chunk carrying the real usage; without it LiteLLM estimates.…, _usage_chunk(), _chunks(), CustomStreamWrapper, Delta (+5 more)

### Community 44 - "test_multimodal_loop.py"
Cohesion: 0.14
Nodes (11): detector(), feed_all(), Multimodal on the Gemini bridge, and the reasoning loop guard. The wire shapes…, Feeds paragraph-separated segments, returning the first reason., Stall: the same vocabulary, reordered, with no new concrete anchor. The fixture…, Reasoning that progresses has to pass; a false positive kills a good turn., test_header_runaway_trips_at_the_threshold(), test_near_duplicate_segments_trip() (+3 more)

### Community 45 - "_messages_to_antigravity_payload"
Cohesion: 0.12
Nodes (20): _antigravity_available_models(), _antigravity_request_id(), _call_antigravity_sync(), _google_content_parts(), _google_inline_part(), _google_media_from_url(), _google_media_part(), _google_model_supports_function_ids() (+12 more)

### Community 46 - "Exception"
Cohesion: 0.23
Nodes (16): Exception, _build_codex_headers(), _call_codex_sync(), _codex_capture_response_state(), _codex_composite_call_id(), _codex_open(), _codex_open_async(), _codex_redeem_reset_credit() (+8 more)

### Community 47 - "test_parity_batch.py"
Cohesion: 0.24
Nodes (12): load(), Behaviours measured on the wire, pinned so they cannot silently regress. Every…, Every caller must unpack exactly what the bridge entry point returns. Adding…, Extract pure helpers by AST; importing the plugin needs a live proxy., test_adaptive_is_the_default_for_unknown_models(), test_antigravity_never_serves_a_name_it_was_not_asked_for(), test_bridge_result_tuples_are_unpacked_consistently(), test_codex_aliases_never_rename_a_version() (+4 more)

### Community 48 - "permissions"
Cohesion: 0.29
Nodes (7): $ref, description, items, type, uniqueItems, items, permissions

### Community 49 - "3. LiteLLM Wire Bridge (`sitecustomize.py`)"
Cohesion: 0.12
Nodes (16): 1. Quota Dashboard (Web & Backend), 2. Quota Desktop (Tauri v2 App / Local Loopback Bridge), 3. LiteLLM Wire Bridge (`sitecustomize.py`), Core Components, Deployment identity, Multimodal input, Prompt Caching Breakpoints (Anthropic), Reasoning visibility (+8 more)

### Community 50 - "isRecord"
Cohesion: 0.30
Nodes (11): anthropicProxy(), applyConversationCache(), CACHE_CONTROL, claudeOAuthBody(), countCacheBreakpoints(), markCacheableContent(), isRecord(), ensureFresh() (+3 more)

### Community 51 - "_apply_conversation_cache"
Cohesion: 0.22
Nodes (10): _anthropic_cache_control(), _anthropic_markable_message(), _anthropic_tool_call_anchor(), _apply_conversation_cache(), _count_cache_breakpoints(), _mark_cache_breakpoint(), Whether a breakpoint can be attached to this message. OMP marks the Anthropic…, Index of the last tool call LiteLLM agrees to mark.… (+2 more)

### Community 52 - "properties"
Cohesion: 0.15
Nodes (13): properties, default, description, type, array, null, description, type (+5 more)

### Community 53 - "_stream_antigravity_once"
Cohesion: 0.13
Nodes (17): _antigravity_collect(), _google_finish_reason(), _google_is_flash_leak_model(), _google_is_planning_leak(), _google_loop_guard(), _google_raise_in_band(), Translates candidates[0].finishReason into the OpenAI shape., CCA returns errors inside the stream with HTTP 200. Swallowing them makes the… (+9 more)

### Community 55 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 56 - "CapabilityRemote"
Cohesion: 0.33
Nodes (6): description, properties, required, type, CapabilityRemote, urls

### Community 57 - "_read_tokens"
Cohesion: 0.33
Nodes (6): Read the credentials the agent synced into the Kubernetes Secret., Read the credentials.json the agent writes on the shared volume., Kubernetes Secret first, then the agent's credentials.json., _read_tokens(), _read_tokens_from_credentials_file(), _read_tokens_from_secret()

### Community 58 - "windows-schema.json"
Cohesion: 0.40
Nodes (4): anyOf, description, $schema, title

### Community 59 - "_antigravity_open"
Cohesion: 0.50
Nodes (5): _antigravity_mark_host(), _antigravity_open(), _antigravity_open_async(), _antigravity_urls(), Tries the endpoints in order (last good first), refreshing the token on 401.…

### Community 60 - "📸 Screenshots"
Cohesion: 0.67
Nodes (3): 1. Real-Time Subscription & Cluster Quota Dashboard, 2. LiteLLM Proxy Unified Model Catalog, 📸 Screenshots

### Community 61 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 62 - "🖥️ Why is Quota Desktop Needed? (The Localhost Port Binding Constraint)"
Cohesion: 0.67
Nodes (3): The Remote Cluster Dilemma, The Solution: Quota Desktop as a Loopback Bridge, 🖥️ Why is Quota Desktop Needed? (The Localhost Port Binding Constraint)

### Community 64 - "Target"
Cohesion: 0.67
Nodes (3): Target, description, oneOf

## Knowledge Gaps
- **211 isolated node(s):** `name`, `version`, `description`, `@types/bun`, `typescript` (+206 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `bun` connect `compilerOptions` to `oauth.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `_wrapped_acompletion()` (e.g. with `sitecustomize.py` and `_call_antigravity_sync()`) actually correct?**
  _`_wrapped_acompletion()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `_wrapped_router_acompletion()` (e.g. with `sitecustomize.py` and `_call_antigravity_sync()`) actually correct?**
  _`_wrapped_router_acompletion()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _211 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `usage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11182795698924732 - nodes in this community are weakly interconnected._
- **Should `oauth.rs` be split into smaller, more focused modules?**
  _Cohesion score 0.13434343434343435 - nodes in this community are weakly interconnected._
- **Should `definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._