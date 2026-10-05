# CLAUDE.md - Project Documentation

This file documents the Alan-More project architecture, goals, and conventions for Claude Code.

## 📋 Project Overview

**Name:** Alan-More  
**Purpose:** Integrate Jev (structured decision-making) with Claude Code via Vercel AI Gateway  
**Status:** Active Development  
**Branch:** `claude/jev-invocation-audit-o6404h`

## 🎯 Goals

1. **Dual-Channel AI Architecture**
   - Claude Code continues using Anthropic API normally for regular tasks
   - Jev handles structured decisions through Vercel AI Gateway
   - Both APIs coexist without conflicts

2. **Secure Secret Management**
   - Store `AI_GATEWAY_API_KEY` in Claude Platform Credential Vaults
   - Automatic injection into Claude Code sessions
   - No secrets in Git, logs, or configuration files

3. **Clear Separation of Concerns**
   - Structured decisions → Jev (guaranteed schema compliance)
   - Regular decisions → Claude (flexible responses)
   - Easy to understand and maintain

## 🏗️ Architecture

### Dual API Setup

```
Claude Code Environment
│
├── [Standard Path]
│   └── Claude Code
│       └── Anthropic API (api.anthropic.com)
│           └── Regular tasks: conversations, code gen, analysis
│
└── [Jev Path]
    └── Claude Code
        └── Vercel AI Gateway
            └── Jev Orchestration
                └── Structured decisions: classification, validation, scoring
```

### Key Design Decisions

1. **Separate Clients**
   - `createJevGatewayClient()` → Points to Vercel AI Gateway
   - `createStandardAnthropicClient()` → Points to api.anthropic.com
   - Both configured in `src/jev-gateway.js`

2. **Environment Variables**
   - `AI_GATEWAY_API_KEY` - Stored in Claude Platform Credential Vaults
   - `ANTHROPIC_BASE_URL` - Remains unchanged (api.anthropic.com)
   - Automatically injected in new Claude Code sessions

3. **Function-Based API**
   - `makeStructuredDecision()` - For Jev decisions
   - `makeRegularDecision()` - For standard Claude
   - Both return Promises with clear types

## 📂 Project Structure

```
alan-more/
├── package.json                          # npm dependencies
├── README.md                             # User-facing documentation
├── CLAUDE.md                             # This file (Claude reference)
├── .env.example                          # Environment variables reference
├── .gitignore                            # Git exclusions (secrets, node_modules)
│
├── src/
│   ├── index.js                          # Main entry point
│   ├── jev-gateway.js                    # Core Jev integration module
│   └── examples/
│       ├── jev-structured-decision.js    # Jev usage examples
│       └── normal-claude-usage.js        # Standard API examples
│
└── node_modules/                         # Dependencies (git-ignored)
```

## 🔐 Security

### Secrets Management

**✅ Stored Securely:**
- `AI_GATEWAY_API_KEY` → Claude Platform Credential Vaults
- Encrypted at rest
- Never exposed in logs or Git
- Automatically injected into sessions

**❌ NEVER:**
- Hardcode secrets in code
- Log `process.env.AI_GATEWAY_API_KEY`
- Commit `.env` files with actual keys
- Pass secrets to untrusted functions

### Best Practices

```javascript
// ✅ CORRECT
const apiKey = process.env.AI_GATEWAY_API_KEY;
if (!apiKey) throw new Error("API_GATEWAY_API_KEY not found");

// ❌ WRONG
console.log(process.env.AI_GATEWAY_API_KEY);  // Never log!
const key = "sk_test_12345...";               // Never hardcode!
```

## 🚀 Getting Started

### For New Claude Code Sessions

1. **Automatically injected:**
   ```
   AI_GATEWAY_API_KEY=<your-vercel-key>  (from Credential Vault)
   ANTHROPIC_BASE_URL=https://api.anthropic.com  (default)
   ```

2. **Use in code:**
   ```javascript
   import { makeStructuredDecision, makeRegularDecision } from "./src/jev-gateway.js";
   
   // Structured decision (Jev)
   const structured = await makeStructuredDecision({...});
   
   // Regular decision (Claude)
   const regular = await makeRegularDecision("...prompt...");
   ```

### For Local Development

1. **Setup:**
   ```bash
   npm install
   ```

2. **Test examples:**
   ```bash
   node src/examples/jev-structured-decision.js
   node src/examples/normal-claude-usage.js
   ```

## 📝 Conventions

### Naming

- **Files:** kebab-case (`jev-gateway.js`, `structured-decision.js`)
- **Functions:** camelCase (`makeStructuredDecision()`)
- **Constants:** UPPER_SNAKE_CASE (`API_GATEWAY_API_KEY`)
- **Classes:** PascalCase (not used yet)

### Documentation

- **JSDoc comments** for all exported functions
- **Clear examples** in docstrings
- **Error messages** that guide users to solutions

### Code Style

- **ES Modules** (`import`/`export`)
- **Async/await** for promises
- **Error handling** with try/catch
- **TypeScript comments** for clarity (no TS yet)

## 🧪 Testing

### Current Status
- ✅ Manual examples in `src/examples/`
- ⏳ Automated test suite planned

### Run Examples
```bash
# Structured decision examples
node src/examples/jev-structured-decision.js

# Regular decision examples
node src/examples/normal-claude-usage.js
```

### Future Tests
```bash
npm test  # Planned automated test suite
```

## 🔄 Common Tasks

### Add a New Structured Decision

1. **Create function in** `src/jev-gateway.js` or `src/examples/`
   ```javascript
   export async function myStructuredTask(input) {
     return makeStructuredDecision({
       prompt: `Process: ${input}`,
       schema: { /* JSON schema */ }
     });
   }
   ```

2. **Test it:**
   ```bash
   node -e "import('./src/jev-gateway.js').then(m => m.myStructuredTask('test'))"
   ```

### Update Dependencies

```bash
npm install --save <package-name>
npm update
npm audit  # Check for vulnerabilities
```

### Debug Issues

```javascript
// Check if API key is set
console.error("Key exists:", !!process.env.AI_GATEWAY_API_KEY);

// Check client configuration
console.error("Client config", { 
  apiKey: !!process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://api.gateway.vercel.com"
});
```

## 🐛 Troubleshooting

### "AI_GATEWAY_API_KEY not found"
- **Cause:** Current session was started before credential was created
- **Fix:** Start a new Claude Code session (keys are injected on startup)

### "Failed to connect to Vercel AI Gateway"
- **Cause:** Network issue, invalid key, or service down
- **Fix:** Check key in Credential Vaults, verify Vercel service status

### "Schema validation failed"
- **Cause:** Response doesn't match defined schema
- **Fix:** Check schema definition, increase `maxTokens`, lower `temperature`

## 📚 References

### Internal
- `README.md` - User guide
- `src/jev-gateway.js` - Implementation details
- `src/examples/` - Working code examples

### External
- [Anthropic Docs](https://docs.anthropic.com)
- [Jev GitHub](https://github.com/OpenGeni/jev)
- [JSON Schema](https://json-schema.org)

## 🗂️ Next Steps

- [ ] Add unit tests for Jev integration
- [ ] Add integration tests with real API calls
- [ ] Create advanced examples (multi-step decisions, chaining)
- [ ] Add metrics/monitoring
- [ ] Document performance characteristics
- [ ] Create deployment guide

## 📞 Support

**Questions about:**
- **Jev integration** → See `README.md` and `src/jev-gateway.js`
- **Claude Code setup** → Check `CLAUDE.md` (this file)
- **Examples** → See `src/examples/` directory
- **Security** → See "Security" section above

---

**Last Updated:** October 5, 2026  
**Author:** Alan More  
**Status:** Active Development
