# Graph Report - tokengateway  (2026-09-17)

## Corpus Check
- 41 files · ~75,062 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 498 nodes · 821 edges · 24 communities (21 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef6916f5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- usage.ts
- sitecustomize.py
- README.md
- oauth.rs
- definitions
- properties
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
- auth.ts
- server.test.ts
- Changes
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `isRecord()` - 19 edges
2. `readString()` - 16 edges
3. `OAuthState` - 16 edges
4. `_wrapped_acompletion()` - 14 edges
5. `⚡ TokenGateway` - 14 edges
6. `_wrapped_router_acompletion()` - 13 edges
7. `handleApi()` - 12 edges
8. `loadCredentials()` - 12 edges
9. `handle_token_exchange()` - 12 edges
10. `readNumber()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `start_listeners()`  [INFERRED]
  desktop/src-tauri/src/lib.rs → desktop/src-tauri/src/oauth.rs
- `LiteLLMCredential` --inherits--> `StoredCredential`  [EXTRACTED]
  dashboard/src/litellm.ts → dashboard/src/store.ts
- `PendingLogin` --references--> `ProviderId`  [EXTRACTED]
  dashboard/src/oauth.ts → dashboard/src/providers.ts
- `start_login()` --calls--> `generate_pkce()`  [INFERRED]
  desktop/src-tauri/src/lib.rs → desktop/src-tauri/src/oauth.rs
- `paste_redirect()` --calls--> `handle_token_exchange()`  [INFERRED]
  desktop/src-tauri/src/lib.rs → desktop/src-tauri/src/oauth.rs

## Import Cycles
- None detected.

## Communities (24 total, 3 thin omitted)

### Community 0 - "usage.ts"
Cohesion: 0.06
Nodes (80): handleApi(), logins, LoginState, PORT, refreshSweep(), server, isRecord(), readNumber() (+72 more)

### Community 1 - "sitecustomize.py"
Cohesion: 0.08
Nodes (49): CustomLogger, _anthropic_cache_control(), _anthropic_markable_message(), AnthropicCacheHandler, _apply_conversation_cache(), _bridge_usage(), _build_codex_headers(), _call_antigravity_sync() (+41 more)

### Community 2 - "README.md"
Cohesion: 0.04
Nodes (38): 1. Dashboard (Bun / TypeScript), 2. Quota Desktop (Tauri v2 / Rust + Vite), 3. LiteLLM Gateway & Plugin, Contributing to LLM Quota Dashboard & Gateway, Development Setup, Pull Request Guidelines, 1. Quota Dashboard (Web & Backend), 2. Quota Desktop (Tauri v2 App / Local Loopback Bridge) (+30 more)

### Community 3 - "oauth.rs"
Cohesion: 0.13
Nodes (42): Client, get_cluster_usage(), get_status(), open_browser(), open_url(), paste_redirect(), AppHandle, Arc (+34 more)

### Community 4 - "definitions"
Cohesion: 0.05
Nodes (40): anyOf, description, required, type, description, properties, required, type (+32 more)

### Community 5 - "properties"
Cohesion: 0.05
Nodes (40): properties, default, description, type, description, type, $ref, type (+32 more)

### Community 6 - "definitions"
Cohesion: 0.05
Nodes (37): anyOf, description, required, type, description, properties, required, type (+29 more)

### Community 7 - "properties"
Cohesion: 0.06
Nodes (37): properties, default, description, type, description, type, $ref, type (+29 more)

### Community 8 - "⚡ TokenGateway"
Cohesion: 0.11
Nodes (18): 1. Real-Time Subscription & Cluster Quota Dashboard, 2. LiteLLM Proxy Unified Model Catalog, 🏗️ Architecture, 🤝 Contributing, 📖 Documentation, Existing LiteLLM without Docker, ✨ Features, ⚠️ Known Security Issues (+10 more)

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

## Knowledge Gaps
- **189 isolated node(s):** `name`, `version`, `description`, `@types/bun`, `typescript` (+184 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `properties` connect `properties` to `definitions`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `definitions`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `_wrapped_acompletion()` (e.g. with `sitecustomize.py` and `_call_antigravity_sync()`) actually correct?**
  _`_wrapped_acompletion()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _189 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `usage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05972288580984233 - nodes in this community are weakly interconnected._
- **Should `sitecustomize.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08182349503214495 - nodes in this community are weakly interconnected._
- **Should `README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._