# CLAUDE.md - Project Documentation

**Project:** Alan-More Jev Integration  
**Purpose:** Integrate Jev (structured decision-making) with Claude Code via Vercel AI Gateway  
**Status:** Active Development  
**Branch:** `claude/jev-invocation-audit-rbu8fy`

## 🎯 Goals

1. **Single Gateway for App Calls**
   - Claude Code itself continues using the Anthropic API normally
   - The app's structured (Jev) and regular decisions both go through Vercel AI Gateway
   - No `ANTHROPIC_API_KEY` is needed for the app

2. **Secure Secret Management**
   - `AI_GATEWAY_API_KEY` stored in Claude Platform Credential Vaults
   - Automatic injection into Claude Code sessions
   - No secrets in Git, logs, or configuration

3. **Clear Separation of Concerns**
   - Structured decisions → Jev (typed choice / yes-no / score answers)
   - Regular decisions → Claude (flexible responses)

## 🏗️ Architecture

```
Claude Code Environment
└── Vercel AI Gateway (ai-gateway.vercel.sh)
    ├── [Jev Path] makeStructuredDecision → typesafe-ai/jev
    │   └── @opengeni/jev JevClient, baseUrl /typesafe (POST /typesafe/v1/systemone)
    │   └── Structured decisions: classification, validation
    └── [Regular Path] makeRegularDecision → anthropic/claude-opus-5-5
        └── Anthropic SDK, POST /v1/messages
        └── Regular tasks: conversations, code gen, analysis
```

- Gateway model IDs are provider-prefixed (`typesafe-ai/...`, `anthropic/...`)
- `makeStructuredDecision` takes `{ state, questions }` and returns `{ answers, model, usage, costUsd }`;
  Jev can't produce free-form fields, so use `makeRegularDecision` for those
- `createStandardAnthropicClient()` (direct `api.anthropic.com`) is still exported but unused

## 📂 Project Structure

```
alan-more/
├── package.json
├── README.md
├── CLAUDE.md
├── .env.example
├── .gitignore
├── src/
│   ├── index.js
│   ├── jev-gateway.js
│   └── examples/
│       ├── jev-structured-decision.js
│       └── normal-claude-usage.js
└── node_modules/
```

## 🔐 Security

**✅ Stored Securely:**
- `AI_GATEWAY_API_KEY` → Claude Platform Credential Vaults
- Encrypted, persistent across sessions
- Never in logs, Git, or plaintext config
- In cloud sessions the egress proxy injects gateway credentials; with no
  `AI_GATEWAY_API_KEY` set, the client sends a placeholder the proxy replaces

**❌ NEVER:**
- Hardcode secrets
- Log `process.env.AI_GATEWAY_API_KEY`
- Commit `.env` with actual keys

## 🚀 Getting Started

1. **In a new Claude Code session:**
   ```javascript
   import { makeStructuredDecision, makeRegularDecision } from "./src/jev-gateway.js";
   
   const decision = await makeStructuredDecision({ state, questions });
   const response = await makeRegularDecision("...");
   ```

2. **Run examples:**
   ```bash
   NODE_USE_ENV_PROXY=1 node src/examples/jev-structured-decision.js
   NODE_USE_ENV_PROXY=1 node src/examples/normal-claude-usage.js
   ```
   `NODE_USE_ENV_PROXY=1` makes Node route requests through the cloud session proxy
   (without it the gateway returns `403 Host not in allowlist`). It's harmless elsewhere.

## 📝 Conventions

- **Files:** kebab-case
- **Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Code Style:** ES Modules, async/await, try/catch

## 🧪 Testing

Current examples in `src/examples/` are working tests.

## 🔄 Next Steps

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Create advanced examples
- [ ] Add metrics/monitoring
- [ ] Create deployment guide

---

**Last Updated:** October 6, 2026
