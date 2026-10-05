# Alan-More: Jev Integration with Vercel AI Gateway

Integrate **Jev** (structured decision-making) with **Claude Code** while maintaining normal Anthropic API usage.

## 🎯 Architecture

```
Claude Code
├── Regular Tasks → Anthropic API (api.anthropic.com)
│   └── Conversations, code generation, analysis
└── Structured Decisions → Vercel AI Gateway → Jev
    └── Classification, validation, scoring
```

## 🔐 Setup

The `AI_GATEWAY_API_KEY` is stored securely in Claude Platform Credential Vaults and automatically injected into new Claude Code sessions.

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

### Regular Decision (Standard API)

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

## 🔑 Key Functions

- `makeStructuredDecision(config)` - Jev decisions via Vercel AI Gateway
- `makeRegularDecision(prompt, options)` - Standard Claude API usage
- `createJevGatewayClient()` - Jev client
- `createStandardAnthropicClient()` - Standard client

## 🔒 Security

- ✅ `AI_GATEWAY_API_KEY` encrypted in Claude Platform
- ✅ Automatic injection into sessions
- ✅ No secrets in Git or logs
- ✅ ANTHROPIC_BASE_URL unchanged

## 📄 License

MIT
