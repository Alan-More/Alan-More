# Alan-More: Jev Integration with Vercel AI Gateway

Integrate **Jev** (structured decision-making) with **Claude Code**, routing both Jev and Claude calls through the Vercel AI Gateway.

## 🎯 Architecture

```
Claude Code
└── Vercel AI Gateway (ai-gateway.vercel.sh)
    ├── Structured Decisions → Jev (typesafe-ai/jev, POST /typesafe/v1/systemone)
    │   └── Classification, validation, scoring
    └── Regular Decisions → Claude (anthropic/claude-opus-5-5, POST /v1/messages)
        └── Conversations, code generation, analysis
```

Both paths use the same gateway credentials, so no `ANTHROPIC_API_KEY` is needed.

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
  state: "Customer review: 'Great product!'",
  questions: {
    sentiment: {
      type: "choice",
      instructions: "What is the overall sentiment of the review?",
      criteria: { positive: null, negative: null, neutral: null }
    },
    wouldRecommend: { type: "noul", instructions: "Would this customer recommend the product?" }
  }
});

decision.answers.sentiment.option;        // "positive"
decision.answers.sentiment.probabilities; // { positive: 1, neutral: 0, negative: 0 }
decision.answers.wouldRecommend.probability; // 0..1
decision.model;                           // "typesafe-ai/jev"
```

Jev answers typed questions (`choice`, `noul` yes/no probability, `score`) about a state. It doesn't generate free-form text or arbitrary JSON; use `makeRegularDecision` for that.

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

- `makeStructuredDecision({ state, questions })` - Jev (`typesafe-ai/jev`) decisions via Vercel AI Gateway
- `makeRegularDecision(prompt, options)` - Free-form Claude responses via Vercel AI Gateway
- `createJevClient()` - TypeSafe Jev client (`@opengeni/jev`) pointed at the gateway
- `createJevGatewayClient()` - Anthropic SDK client pointed at the gateway (used for Claude)
- `createStandardAnthropicClient()` - Direct `api.anthropic.com` client (unused by the functions above; requires `ANTHROPIC_API_KEY`)

## 🔒 Security

- ✅ `AI_GATEWAY_API_KEY` encrypted in Claude Platform
- ✅ Automatic injection into sessions
- ✅ No secrets in Git or logs
- ✅ ANTHROPIC_BASE_URL unchanged (Claude Code itself still uses the Anthropic API)

## 📄 License

MIT
