# Graph Report - tokengateway  (2026-10-01)

## Corpus Check
- 54 files · ~99,089 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 733 nodes · 1259 edges · 73 communities (67 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f209f873`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- usage.ts
- _wrapped_acompletion
- test_cache_anchor.py
- oauth.rs
- definitions
- permissions
- definitions
- webviews
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
- oauth.ts
- sitecustomize.py
- litellm.ts
- providers.ts
- store.ts
- webviews
- properties
- CapabilityRemote
- _ThinkingLoopDetector
- server.ts
- Development Setup
- omniRouteQuota
- Capability
- desktop-schema.json
- README.md
- Read-only ChatGPT quotas for an existing LiteLLM service
- LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible)
- local
- _codex_request_body
- _stream_antigravity_once
- test_multimodal_loop.py
- Exception
- _build_codex_headers
- test_parity_batch.py
- permissions
- 3. LiteLLM Wire Bridge (`sitecustomize.py`)
- isRecord
- _apply_conversation_cache
- properties
- _antigravity_collect
- _BridgeStreamWrapper
- Capability
- CapabilityRemote
- TokenManager
- windows-schema.json
- Google Antigravity (Cloud Code API) Setup Guide
- omniroute.ts
- OpenAI ChatGPT Plus / Codex Responses API Setup Guide
- deepseek-liteLLM-sync.test.ts
- AnthropicCacheHandler
- local
- auth.ts
- Identifier
- Target
- Target
- Identifier
- 📸 Screenshots
- 🖥️ Why is Quota Desktop Needed? (The Localhost Port Binding Constraint)
- quota-desktop

## God Nodes (most connected - your core abstractions)
1. `isRecord()` - 30 edges
2. `readString()` - 20 edges
3. `loadCredentials()` - 19 edges
4. `OAuthState` - 16 edges
5. `_wrapped_acompletion()` - 16 edges
6. `handleApi()` - 15 edges
7. `_stream_antigravity_once()` - 15 edges
8. `_wrapped_router_acompletion()` - 15 edges
9. `_stream_codex_generator()` - 14 edges
10. `⚡ TokenGateway` - 14 edges

## Surprising Connections (you probably didn't know these)
- `refresh()` --indirect_call--> `isRecord()`  [INFERRED]
  dashboard/src/omniroute.ts → dashboard/src/guards.ts
- `run()` --calls--> `start_listeners()`  [INFERRED]
  desktop/src-tauri/src/lib.rs → desktop/src-tauri/src/oauth.rs
- `findLiteLLMModelId()` --calls--> `isRecord()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/guards.ts
- `findLiteLLMModelId()` --calls--> `readString()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/guards.ts
- `handleApi()` --calls--> `isRecord()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/guards.ts

## Import Cycles
- None detected.

## Communities (73 total, 6 thin omitted)

### Community 0 - "usage.ts"
Cohesion: 0.11
Nodes (29): readTimestampMs(), isDefinitiveOAuthFailure(), AgentItem, ANTHROPIC_KIND_LABELS, clusterStats(), codexRateLimitBlock(), codexWindow(), cooldownMap (+21 more)

### Community 1 - "_wrapped_acompletion"
Cohesion: 0.18
Nodes (21): _attach_codex_quota(), _bridge_message(), _bridge_stream_result(), _call_codex_sync(), _codex_finish_reason(), _codex_quota_headers(), _emit_bridge_success(), _inject_claude_prompt() (+13 more)

### Community 2 - "test_cache_anchor.py"
Cohesion: 0.29
Nodes (12): breakpoints(), conversation(), load_plugin(), Cache breakpoints must follow the tail of a tool-driven conversation.…, Extract the pure helpers by AST; the plugin hooks a live proxy on import., Every level LiteLLM reads a breakpoint from, keyed by message index., A tool-driven conversation: user, then `turns` tool_call/result pairs., test_anchor_advances_as_the_conversation_grows() (+4 more)

### Community 3 - "oauth.rs"
Cohesion: 0.13
Nodes (42): Client, get_cluster_usage(), get_status(), open_browser(), open_url(), paste_redirect(), AppHandle, Arc (+34 more)

### Community 4 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, Number, PermissionEntry, ShellScopeEntryAllowedArg, ShellScopeEntryAllowedArgs, Value, anyOf, description (+8 more)

### Community 5 - "permissions"
Cohesion: 0.29
Nodes (7): $ref, description, items, type, uniqueItems, items, permissions

### Community 6 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, Number, PermissionEntry, ShellScopeEntryAllowedArg, ShellScopeEntryAllowedArgs, Value, anyOf, description (+8 more)

### Community 7 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 8 - "⚡ TokenGateway"
Cohesion: 0.17
Nodes (12): 🏗️ Architecture, 🤝 Contributing, 📖 Documentation, Existing LiteLLM without Docker, ✨ Features, ⚠️ Known Security Issues, 📄 License, 🚀 Quick Start (Docker Compose) (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, skipLibCheck, strict (+8 more)

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
Cohesion: 0.25
Nodes (7): DeepSeek balance card (2026-09-22), Local deployment verified 2026-09-17, Managed Claude prompt caching (2026-09-17), OmniRoute quota cards (2026-10-01), Operational notes, Project memory, Scope and decisions

### Community 17 - "server.test.ts"
Cohesion: 0.40
Nodes (3): headers, names, priorEnv

### Community 18 - "Changes"
Cohesion: 0.18
Nodes (10): 2026-09-17 - Claude reasoning bridge verification, 2026-09-17 - Managed Claude alongside native ChatGPT, 2026-09-17 - Native Anthropic prompt-cache breakpoints, 2026-09-17 - Native LiteLLM quota panel, 2026-09-17 - Native refresh integration test, 2026-09-17 - Separate local ChatGPT session, 2026-09-17 - Sync upstream tokengateway fixes, 2026-09-22 - DeepSeek balance card (+2 more)

### Community 24 - "oauth.ts"
Cohesion: 0.24
Nodes (14): readString(), discoverAntigravityProject(), exchangeCode(), OAuthConfig, parseTokenResponse(), pending, PendingLogin, readIdTokenClaims() (+6 more)

### Community 25 - "sitecustomize.py"
Cohesion: 0.11
Nodes (27): _antigravity_available_models(), _antigravity_base_family(), _antigravity_request_id(), _call_antigravity_sync(), _google_content_parts(), _google_finish_reason(), _google_media_part(), _google_model_supports_function_ids() (+19 more)

### Community 26 - "litellm.ts"
Cohesion: 0.16
Nodes (12): readNumber(), claims(), LiteLLMCredential, liteLLMQuotaApi(), usage(), readLiteLLMCredential(), CODEX_USAGE_URL, StoredCredential (+4 more)

### Community 27 - "providers.ts"
Cohesion: 0.20
Nodes (9): ANTHROPIC_SCOPES, ANTHROPIC_USAGE_URL, ANTIGRAVITY_ENDPOINT, ANTIGRAVITY_USER_AGENT, CLAUDE_HEADERS, DEEPSEEK_BALANCE_URL, GOOGLE_SCOPES, PROVIDER_IDS (+1 more)

### Community 28 - "store.ts"
Cohesion: 0.25
Nodes (12): refreshSweep(), atomicWriteJson(), isProviderId(), applyOverlay(), CredentialMap, deleteCredential(), loadCredentials(), mutate() (+4 more)

### Community 29 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 30 - "properties"
Cohesion: 0.13
Nodes (15): properties, default, description, type, type, array, null, description (+7 more)

### Community 31 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 32 - "_ThinkingLoopDetector"
Cohesion: 0.32
Nodes (4): Detects runaway reasoning from the text as it streams by. Deliberate deviation…, Returns the loop reason, or None. Never raises., _ThinkingLoopDetector, _trigrams()

### Community 33 - "server.ts"
Cohesion: 0.17
Nodes (18): dashboardApi(), DEEPSEEK_MODELS, deleteDeepSeekModel(), findLiteLLMModelId(), handleApi(), LITELLM_BASE_URL, liteLLMAdminFetch(), logins (+10 more)

### Community 34 - "Development Setup"
Cohesion: 0.29
Nodes (6): 1. Dashboard (Bun / TypeScript), 2. Quota Desktop (Tauri v2 / Rust + Vite), 3. LiteLLM Gateway & Plugin, Contributing to LLM Quota Dashboard & Gateway, Development Setup, Pull Request Guidelines

### Community 35 - "omniRouteQuota"
Cohesion: 0.31
Nodes (7): omniRouteQuota(), get(), login(), refresh(), safeError(), servers, windows

### Community 36 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 37 - "desktop-schema.json"
Cohesion: 0.40
Nodes (4): anyOf, description, $schema, title

### Community 38 - "README.md"
Cohesion: 0.25
Nodes (5): Anthropic Claude Max OAuth Setup Guide, Authentication via Quota Desktop, How it works, Manual Authentication via Terminal (Oh My Pi / OMP), Read-only OmniRoute quota cards

### Community 39 - "Read-only ChatGPT quotas for an existing LiteLLM service"
Cohesion: 0.22
Nodes (9): DeepSeek balance card (optional), Install without Docker, Managed Claude (optional, experimental), Open the dashboard, Optional OmniRoute read-only account quotas, Other deployment modes, Quota and failure semantics, Read-only ChatGPT quotas for an existing LiteLLM service (+1 more)

### Community 40 - "LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible)"
Cohesion: 0.29
Nodes (6): Credits & References, In Docker / Docker Compose, In Kubernetes, Installation, LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible), What it does

### Community 41 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 42 - "_codex_request_body"
Cohesion: 0.12
Nodes (18): _codex_file_part(), _codex_image_part(), _codex_prompt_cache_key(), _codex_request_body(), _codex_split_call_id(), _codex_tool_choice(), _codex_wire_generation(), _content_to_codex_parts() (+10 more)

### Community 43 - "_stream_antigravity_once"
Cohesion: 0.13
Nodes (18): _bridge_usage(), _codex_composite_call_id(), _codex_usage(), _google_usage(), omp-google-shared.ts: promptTokenCount *includes* cached tokens, so it is…, OMP `eRe`: unlike Google, input_tokens is not reduced by cached_tokens., Final stream chunk carrying the real usage; without it LiteLLM estimates.…, _stream_antigravity_once() (+10 more)

### Community 44 - "test_multimodal_loop.py"
Cohesion: 0.14
Nodes (11): detector(), feed_all(), Multimodal on the Gemini bridge, and the reasoning loop guard. The wire shapes…, Feeds paragraph-separated segments, returning the first reason., Stall: the same vocabulary, reordered, with no new concrete anchor. The fixture…, Reasoning that progresses has to pass; a false positive kills a good turn., test_header_runaway_trips_at_the_threshold(), test_near_duplicate_segments_trip() (+3 more)

### Community 45 - "Exception"
Cohesion: 0.31
Nodes (9): Exception, _antigravity_mark_host(), _antigravity_open(), _antigravity_open_async(), _antigravity_urls(), _google_inline_part(), _google_media_from_url(), `inlineData` from a data URI or from an http(s) URL. Measured on the backend:… (+1 more)

### Community 46 - "_build_codex_headers"
Cohesion: 0.26
Nodes (12): _build_codex_headers(), _codex_capture_response_state(), _codex_open(), _codex_open_async(), _codex_redeem_reset_credit(), _codex_remember_unsupported(), _codex_reset_credits(), _codex_token_claims() (+4 more)

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
Cohesion: 0.27
Nodes (12): anthropicProxy(), applyConversationCache(), CACHE_CONTROL, claudeOAuthBody(), countCacheBreakpoints(), markCacheableContent(), isRecord(), completeLoginWithCode() (+4 more)

### Community 51 - "_apply_conversation_cache"
Cohesion: 0.22
Nodes (10): _anthropic_cache_control(), _anthropic_markable_message(), _anthropic_tool_call_anchor(), _apply_conversation_cache(), _count_cache_breakpoints(), _mark_cache_breakpoint(), Whether a breakpoint can be attached to this message. OMP marks the Anthropic…, Index of the last tool call LiteLLM agrees to mark.… (+2 more)

### Community 52 - "properties"
Cohesion: 0.13
Nodes (15): properties, default, description, type, type, array, null, description (+7 more)

### Community 53 - "_antigravity_collect"
Cohesion: 0.20
Nodes (10): _antigravity_collect(), _google_is_flash_leak_model(), _google_is_planning_leak(), _google_loop_guard(), _google_raise_in_band(), CCA returns errors inside the stream with HTTP 200. Swallowing them makes the…, Runaway reasoning. Distinct from Exception so it crosses the handlers that…, OMP only watches the families that actually run away; here we serve Gemini. (+2 more)

### Community 55 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 56 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 57 - "TokenManager"
Cohesion: 0.21
Nodes (7): Read the credentials the agent synced into the Kubernetes Secret., Read the credentials.json the agent writes on the shared volume., Kubernetes Secret first, then the agent's credentials.json., _read_tokens(), _read_tokens_from_credentials_file(), _read_tokens_from_secret(), TokenManager

### Community 58 - "windows-schema.json"
Cohesion: 0.40
Nodes (4): anyOf, description, $schema, title

### Community 59 - "Google Antigravity (Cloud Code API) Setup Guide"
Cohesion: 0.33
Nodes (5): Authentication via Quota Desktop, Google Antigravity (Cloud Code API) Setup Guide, How it works, Multimodal Input, Supported Models in LiteLLM

### Community 60 - "omniroute.ts"
Cohesion: 0.40
Nodes (5): Options, Provider, Report, Snapshot, UsageLimit

### Community 61 - "OpenAI ChatGPT Plus / Codex Responses API Setup Guide"
Cohesion: 0.40
Nodes (4): Authentication via Quota Desktop, How it works, OpenAI ChatGPT Plus / Codex Responses API Setup Guide, Supported Models in LiteLLM

### Community 62 - "deepseek-liteLLM-sync.test.ts"
Cohesion: 0.50
Nodes (3): headers, names, priorEnv

### Community 64 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 66 - "Identifier"
Cohesion: 0.67
Nodes (3): Identifier, description, oneOf

### Community 67 - "Target"
Cohesion: 0.67
Nodes (3): Target, description, oneOf

### Community 68 - "Target"
Cohesion: 0.67
Nodes (3): Target, description, oneOf

### Community 69 - "Identifier"
Cohesion: 0.67
Nodes (3): Identifier, description, oneOf

### Community 70 - "📸 Screenshots"
Cohesion: 0.67
Nodes (3): 1. Real-Time Subscription & Cluster Quota Dashboard, 2. LiteLLM Proxy Unified Model Catalog, 📸 Screenshots

### Community 71 - "🖥️ Why is Quota Desktop Needed? (The Localhost Port Binding Constraint)"
Cohesion: 0.67
Nodes (3): The Remote Cluster Dilemma, The Solution: Quota Desktop as a Loopback Bridge, 🖥️ Why is Quota Desktop Needed? (The Localhost Port Binding Constraint)

## Knowledge Gaps
- **231 isolated node(s):** `name`, `version`, `description`, `@types/bun`, `typescript` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `bun` connect `compilerOptions` to `oauth.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `_wrapped_acompletion()` (e.g. with `sitecustomize.py` and `_call_antigravity_sync()`) actually correct?**
  _`_wrapped_acompletion()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `usage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10804597701149425 - nodes in this community are weakly interconnected._
- **Should `oauth.rs` be split into smaller, more focused modules?**
  _Cohesion score 0.13434343434343435 - nodes in this community are weakly interconnected._
- **Should `definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._