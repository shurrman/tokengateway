# Graph Report - tokengateway  (2026-09-17)

## Corpus Check
- 46 files · ~78,674 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 523 nodes · 882 edges · 44 communities (42 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9d591070`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- usage.ts
- sitecustomize.py
- 3. LiteLLM Wire Bridge (`sitecustomize.py`)
- oauth.rs
- definitions
- permissions
- definitions
- properties
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
- oauth.ts
- litellm.ts
- isRecord
- store.ts
- webviews
- properties
- CapabilityRemote
- Development Setup
- README.md
- Read-only ChatGPT quotas for an existing LiteLLM service
- LiteLLM Wire Bridge Plugin (OMP 1:1 Compatible)
- Capability
- desktop-schema.json
- Google Antigravity (Cloud Code API) Setup Guide
- OpenAI ChatGPT Plus / Codex Responses API Setup Guide
- description
- local
- ShellScopeEntryAllowedArgs
- 📸 Screenshots

## God Nodes (most connected - your core abstractions)
1. `isRecord()` - 22 edges
2. `loadCredentials()` - 19 edges
3. `readString()` - 16 edges
4. `OAuthState` - 16 edges
5. `_wrapped_acompletion()` - 14 edges
6. `⚡ TokenGateway` - 14 edges
7. `handleApi()` - 13 edges
8. `_wrapped_router_acompletion()` - 13 edges
9. `fetchAllUsage()` - 12 edges
10. `handle_token_exchange()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `start_listeners()`  [INFERRED]
  desktop/src-tauri/src/lib.rs → desktop/src-tauri/src/oauth.rs
- `handleApi()` --calls--> `isRecord()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/guards.ts
- `handleApi()` --calls--> `readString()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/guards.ts
- `handleApi()` --calls--> `isProviderId()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/providers.ts
- `handleApi()` --calls--> `deleteCredential()`  [EXTRACTED]
  dashboard/server.ts → dashboard/src/store.ts

## Import Cycles
- None detected.

## Communities (44 total, 2 thin omitted)

### Community 0 - "usage.ts"
Cohesion: 0.14
Nodes (20): isDefinitiveOAuthFailure(), AgentItem, ANTHROPIC_KIND_LABELS, clusterStats(), cooldownMap, DownMonitor, fetchAiAgents(), fetchAllUsage() (+12 more)

### Community 1 - "sitecustomize.py"
Cohesion: 0.08
Nodes (49): CustomLogger, _anthropic_cache_control(), _anthropic_markable_message(), AnthropicCacheHandler, _apply_conversation_cache(), _bridge_usage(), _build_codex_headers(), _call_antigravity_sync() (+41 more)

### Community 2 - "3. LiteLLM Wire Bridge (`sitecustomize.py`)"
Cohesion: 0.22
Nodes (8): 1. Quota Dashboard (Web & Backend), 2. Quota Desktop (Tauri v2 App / Local Loopback Bridge), 3. LiteLLM Wire Bridge (`sitecustomize.py`), Core Components, Prompt Caching Breakpoints (Anthropic), Reloading the plugin on Kubernetes, TokenGateway — Architecture & Wire Protocols, Usage Accounting

### Community 3 - "oauth.rs"
Cohesion: 0.13
Nodes (42): Client, get_cluster_usage(), get_status(), open_browser(), open_url(), paste_redirect(), AppHandle, Arc (+34 more)

### Community 4 - "definitions"
Cohesion: 0.05
Nodes (36): anyOf, description, required, type, description, required, type, definitions (+28 more)

### Community 5 - "permissions"
Cohesion: 0.17
Nodes (12): $ref, array, null, description, items, type, uniqueItems, description (+4 more)

### Community 6 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, Number, PermissionEntry, ShellScopeEntryAllowedArg, Target, Value, anyOf, description (+8 more)

### Community 7 - "properties"
Cohesion: 0.05
Nodes (41): properties, properties, default, description, type, description, type, $ref (+33 more)

### Community 8 - "⚡ TokenGateway"
Cohesion: 0.13
Nodes (15): 🏗️ Architecture, 🤝 Contributing, 📖 Documentation, Existing LiteLLM without Docker, ✨ Features, ⚠️ Known Security Issues, 📄 License, 🚀 Quick Start (Docker Compose) (+7 more)

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
Cohesion: 0.40
Nodes (4): Local deployment verified 2026-09-17, Operational notes, Project memory, Scope and decisions

### Community 17 - "server.test.ts"
Cohesion: 0.50
Nodes (3): headers, names, priorEnv

### Community 18 - "Changes"
Cohesion: 0.29
Nodes (6): 2026-09-17 - Claude reasoning bridge verification, 2026-09-17 - Managed Claude alongside native ChatGPT, 2026-09-17 - Native LiteLLM quota panel, 2026-09-17 - Native refresh integration test, 2026-09-17 - Separate local ChatGPT session, Changes

### Community 24 - "server.ts"
Cohesion: 0.16
Nodes (15): dashboardApi(), handleApi(), logins, LoginState, PORT, server, dashboardAuth(), beginLogin() (+7 more)

### Community 25 - "oauth.ts"
Cohesion: 0.17
Nodes (14): pending, PendingLogin, refreshing, TokenPayload, ANTHROPIC_SCOPES, ANTHROPIC_USAGE_URL, ANTIGRAVITY_ENDPOINT, ANTIGRAVITY_USER_AGENT (+6 more)

### Community 26 - "litellm.ts"
Cohesion: 0.17
Nodes (11): claims(), LiteLLMCredential, liteLLMQuotaApi(), readLiteLLMCredential(), CODEX_USAGE_URL, PROVIDERS, StoredCredential, windows (+3 more)

### Community 27 - "isRecord"
Cohesion: 0.29
Nodes (15): isRecord(), readNumber(), readString(), readTimestampMs(), discoverAntigravityProject(), exchangeCode(), parseTokenResponse(), readIdTokenClaims() (+7 more)

### Community 28 - "store.ts"
Cohesion: 0.18
Nodes (19): refreshSweep(), anthropicProxy(), claudeOAuthBody(), atomicWriteJson(), ensureFresh(), refreshCredential(), refreshLatestCredential(), isProviderId() (+11 more)

### Community 29 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 30 - "properties"
Cohesion: 0.22
Nodes (9): properties, Identifier, description, oneOf, type, identifier, remote, anyOf (+1 more)

### Community 31 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 32 - "Development Setup"
Cohesion: 0.29
Nodes (6): 1. Dashboard (Bun / TypeScript), 2. Quota Desktop (Tauri v2 / Rust + Vite), 3. LiteLLM Gateway & Plugin, Contributing to LLM Quota Dashboard & Gateway, Development Setup, Pull Request Guidelines

### Community 33 - "README.md"
Cohesion: 0.29
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
Nodes (4): Authentication via Quota Desktop, Google Antigravity (Cloud Code API) Setup Guide, How it works, Supported Models in LiteLLM

### Community 39 - "OpenAI ChatGPT Plus / Codex Responses API Setup Guide"
Cohesion: 0.40
Nodes (4): Authentication via Quota Desktop, How it works, OpenAI ChatGPT Plus / Codex Responses API Setup Guide, Supported Models in LiteLLM

### Community 40 - "description"
Cohesion: 0.50
Nodes (4): default, description, type, description

### Community 41 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 42 - "ShellScopeEntryAllowedArgs"
Cohesion: 0.67
Nodes (3): ShellScopeEntryAllowedArgs, anyOf, description

### Community 43 - "📸 Screenshots"
Cohesion: 0.67
Nodes (3): 1. Real-Time Subscription & Cluster Quota Dashboard, 2. LiteLLM Proxy Unified Model Catalog, 📸 Screenshots

## Knowledge Gaps
- **199 isolated node(s):** `name`, `version`, `description`, `@types/bun`, `typescript` (+194 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `properties` connect `properties` to `Capability`, `permissions`, `description`, `local`, `webviews`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `definitions`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `definitions` connect `definitions` to `Capability`, `desktop-schema.json`, `ShellScopeEntryAllowedArgs`, `properties`, `CapabilityRemote`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `_wrapped_acompletion()` (e.g. with `sitecustomize.py` and `_call_antigravity_sync()`) actually correct?**
  _`_wrapped_acompletion()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _199 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `usage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Should `sitecustomize.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08182349503214495 - nodes in this community are weakly interconnected._