# CLAUDE.md - Project Documentation

**Project:** Alan-More Jev Integration  
**Purpose:** Integrate Jev (structured decision-making) with Claude Code via Vercel AI Gateway  
**Status:** Active Development  
**Branch:** `claude/jev-invocation-audit-rbu8fy`

## 🎯 Goals

1. **Dual-Channel AI Architecture**
   - Claude Code continues using Anthropic API normally
   - Jev handles structured decisions through Vercel AI Gateway
   - Both APIs coexist without conflicts

2. **Secure Secret Management**
   - `AI_GATEWAY_API_KEY` stored in Claude Platform Credential Vaults
   - Automatic injection into Claude Code sessions
   - No secrets in Git, logs, or configuration

3. **Clear Separation of Concerns**
   - Structured decisions → Jev (guaranteed schema compliance)
   - Regular decisions → Claude (flexible responses)

## 🏗️ Architecture

```
Claude Code Environment
├── [Standard Path]
│   └── Anthropic API (api.anthropic.com)
│       └── Regular tasks: conversations, code gen, analysis
└── [Jev Path]
    └── Vercel AI Gateway
        └── Structured decisions: classification, validation
```

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

**❌ NEVER:**
- Hardcode secrets
- Log `process.env.AI_GATEWAY_API_KEY`
- Commit `.env` with actual keys

## 🚀 Getting Started

1. **In a new Claude Code session:**
   ```javascript
   import { makeStructuredDecision, makeRegularDecision } from "./src/jev-gateway.js";
   
   const decision = await makeStructuredDecision({...});
   const response = await makeRegularDecision("...");
   ```

2. **Run examples:**
   ```bash
   node src/examples/jev-structured-decision.js
   node src/examples/normal-claude-usage.js
   ```

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

**Last Updated:** October 5, 2026
