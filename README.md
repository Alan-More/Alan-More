# Alan-More: Jev Integration with Vercel AI Gateway

Integrate **Jev** (structured decision-making) with **Claude Code**, routing all Claude calls through the Vercel AI Gateway.

## 🎯 Architecture

```
Claude Code
└── Vercel AI Gateway (ai-gateway.vercel.sh, model anthropic/claude-opus-5-5)
    ├── Structured Decisions → Jev
    │   └── Classification, validation, scoring
    └── Regular Decisions
        └── Conversations, code generation, analysis
```

Both paths share one gateway client, so no `ANTHROPIC_API_KEY` is needed.

## 🔐 Setup

The `AI_GATEWAY_API_KEY` is stored securely in Claude Platform Credential Vaults and automatically injected into new Claude Code sessions.

In Claude Code cloud sessions, the egress proxy injects the gateway credentials. If `AI_GATEWAY_API_KEY` is unset, the client sends a placeholder key that the proxy replaces. Outside such an environment, set the real key.

## 📦 Installation

```bash
npm install
```

## 🚀 Usage

### Structured Decision (Jev)

```javascript
import { makeStructuredDecision } from "./src/jev-gateway.js";

const decision = await makeStructuredDecision({
  prompt: "Classify this sentiment: 'Great product!'",
  schema: {
    type: "object",
    properties: {
      sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
      confidence: { type: "number", minimum: 0, maximum: 1 }
    },
    required: ["sentiment", "confidence"]
  }
});
```

### Regular Decision

```javascript
import { makeRegularDecision } from "./src/jev-gateway.js";

const response = await makeRegularDecision(
  "Write a function that validates email addresses"
);
```

## 📚 Examples

```bash
# Structured decisions
node src/examples/jev-structured-decision.js

# Regular decisions
node src/examples/normal-claude-usage.js
```

In Claude Code cloud sessions, prefix each command with `NODE_USE_ENV_PROXY=1` so Node routes requests through the session proxy (Node >= 22.21). Without it, the gateway call fails with `403 Host not in allowlist`.

## 🔑 Key Functions

- `makeStructuredDecision(config)` - Jev decisions via Vercel AI Gateway (returns parsed JSON)
- `makeRegularDecision(prompt, options)` - Free-form Claude responses via Vercel AI Gateway
- `createJevGatewayClient()` - Gateway client used by both functions
- `createStandardAnthropicClient()` - Direct `api.anthropic.com` client (unused by the functions above; requires `ANTHROPIC_API_KEY`)

## 🔒 Security

- ✅ `AI_GATEWAY_API_KEY` encrypted in Claude Platform
- ✅ Automatic injection into sessions
- ✅ No secrets in Git or logs
- ✅ ANTHROPIC_BASE_URL unchanged (Claude Code itself still uses the Anthropic API)

## 📄 License

MIT
