# Alan-More: Jev Integration with Vercel AI Gateway

This project demonstrates how to integrate **Jev** (structured decision-making) with **Claude Code** while maintaining normal Anthropic API usage for regular tasks.

## 🎯 Architecture

```
Claude Code (Claude Platform)
├── ✅ Regular Tasks → Anthropic API (api.anthropic.com)
│   └── Conversations, code generation, analysis
└── 🎯 Structured Decisions → Vercel AI Gateway → Jev
    └── Priority classification, sentiment analysis, data validation
```

## 🔐 Setup

### 1. Claude Platform Credential Vault (Already Configured ✅)

The `AI_GATEWAY_API_KEY` has been securely stored in:
- **Claude Platform** → **Credential Vaults** → **Vercel AI Gateway**
- **Variable Name:** `AI_GATEWAY_API_KEY`
- **Auth Type:** Environment variable
- **Storage:** Encrypted, persistent across sessions

### 2. Environment Variables

When a new Claude Code session starts, the following is automatically injected:

```bash
AI_GATEWAY_API_KEY=<your-vercel-gateway-key>  # From Credential Vault
ANTHROPIC_BASE_URL=https://api.anthropic.com  # Default (unchanged)
```

## 📦 Installation

```bash
npm install
```

### Dependencies

- `@anthropic-ai/sdk` - Main Anthropic API client
- `@opengeni/jev` - Jev decision-making engine

## 🚀 Usage

### Basic Structured Decision (Jev)

```javascript
import { makeStructuredDecision } from "./src/jev-gateway.js";

const decision = await makeStructuredDecision({
  prompt: "Classify this sentiment: 'Great product!'",
  schema: {
    type: "object",
    properties: {
      sentiment: { 
        type: "string", 
        enum: ["positive", "negative", "neutral"] 
      },
      confidence: { type: "number", minimum: 0, maximum: 1 }
    },
    required: ["sentiment", "confidence"]
  }
});

console.log(decision);
// Output: { sentiment: "positive", confidence: 0.95 }
```

### Regular Claude Decision (Standard API)

```javascript
import { makeRegularDecision } from "./src/jev-gateway.js";

const response = await makeRegularDecision(
  "Write a function that validates email addresses"
);

console.log(response);
// Output: Complete, flexible response with code
```

## 📚 Examples

### Structured Decisions (Jev)

```bash
node src/examples/jev-structured-decision.js
```

Includes:
- Sentiment classification
- Priority assessment
- Data quality validation

### Regular Decisions (Standard API)

```bash
node src/examples/normal-claude-usage.js
```

Includes:
- Architecture questions
- Code generation
- Text summarization

## 🔑 Key Functions

### `makeStructuredDecision(config)`

Makes a structured decision using Jev through Vercel AI Gateway.

**Parameters:**
- `prompt` (string): The decision-making prompt
- `schema` (object): JSON Schema defining the response structure
- `model` (string, optional): Model to use (default: `claude-opus-5-5`)
- `temperature` (number, optional): Temperature (0-1, default: 0)

**Returns:** Promise resolving to an object matching the schema

**Use Cases:**
- Classification tasks
- Validation and quality assessment
- Structured data extraction
- Decision making with guaranteed schema compliance

### `makeRegularDecision(prompt, options)`

Makes a regular decision using the standard Anthropic API.

**Parameters:**
- `prompt` (string): The conversation prompt
- `options` (object, optional):
  - `model` (string): Model to use (default: `claude-opus-5-5`)
  - `temperature` (number): Temperature (default: 1)
  - `maxTokens` (number): Max tokens (default: 2048)

**Returns:** Promise resolving to a string response

**Use Cases:**
- Conversations
- Code generation
- Analysis and writing
- General problem-solving

### Client Creation

```javascript
// Jev Gateway Client
const jevClient = createJevGatewayClient();
// Points to: https://api.gateway.vercel.com
// Uses: AI_GATEWAY_API_KEY

// Standard Anthropic Client
const standardClient = createStandardAnthropicClient();
// Points to: https://api.anthropic.com (default)
// Uses: ANTHROPIC_API_KEY (from Claude Code)
```

## 🔒 Security

### What's Protected

- ✅ `AI_GATEWAY_API_KEY` is encrypted and stored in Claude Platform Credential Vaults
- ✅ Never exposed in logs, Git, or configuration files
- ✅ Automatically injected into each Claude Code session
- ✅ Only visible to code accessing `process.env.AI_GATEWAY_API_KEY`

### Best Practices

```javascript
// ❌ NEVER
const key = "sk_test_123..."; // Hardcoded
console.log(process.env.AI_GATEWAY_API_KEY); // Logging secrets

// ✅ ALWAYS
const key = process.env.AI_GATEWAY_API_KEY;
if (!key) throw new Error("AI_GATEWAY_API_KEY not found");
// Use key without logging it
```

## 🎓 When to Use What

| Scenario | Tool | Reason |
|----------|------|--------|
| Sentiment classification | **Jev** | Needs guaranteed schema |
| Priority scoring | **Jev** | Deterministic output format |
| Email validation | **Jev** | Structured, consistent format |
| General Q&A | **Claude (Anthropic)** | Flexible responses |
| Code generation | **Claude (Anthropic)** | Complex, varied output |
| Report writing | **Claude (Anthropic)** | Free-form content |
| Data quality check | **Jev** | Structured validation |
| Multi-step reasoning | **Claude (Anthropic)** | Extended thinking |

## 🧪 Testing

Run tests:

```bash
npm test
```

Development mode (with file watching):

```bash
npm run dev
```

## 📝 Project Structure

```
alan-more/
├── package.json                          # Dependencies
├── README.md                             # This file
├── src/
│   ├── jev-gateway.js                   # Main integration module
│   └── examples/
│       ├── jev-structured-decision.js   # Structured decision examples
│       └── normal-claude-usage.js       # Standard API examples
└── node_modules/                         # Installed packages
```

## 🔄 Workflow

### Adding a New Structured Decision

1. **Create the decision function** in `src/` or `src/examples/`:

```javascript
export async function classifyProductReview(review) {
  return makeStructuredDecision({
    prompt: `Analyze this product review: "${review}"`,
    schema: {
      type: "object",
      properties: {
        rating: { type: "number", minimum: 1, maximum: 5 },
        recommendedFor: { type: "array", items: { type: "string" } }
      },
      required: ["rating", "recommendedFor"]
    }
  });
}
```

2. **Use in your code:**

```javascript
const result = await classifyProductReview("Excellent quality!");
console.log(result); // { rating: 5, recommendedFor: [...] }
```

3. **Test it:**

```bash
node src/your-new-file.js
```

## 📖 Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Jev Documentation](https://github.com/OpenGeni/jev)
- [JSON Schema Reference](https://json-schema.org)

## 🚨 Troubleshooting

### "AI_GATEWAY_API_KEY not found"

**Solution:** Start a fresh Claude Code session. The credential is injected only in new sessions.

```bash
# Check if the variable exists
echo $AI_GATEWAY_API_KEY  # Should show the key value (don't log this!)

# If empty, start a new Claude Code session
```

### "Failed to connect to API Gateway"

**Possible causes:**
- Network connectivity issue
- API key is invalid or revoked
- Vercel AI Gateway service is down

**Solution:**
1. Verify `AI_GATEWAY_API_KEY` is set correctly
2. Check Vercel AI Gateway status
3. Test with the Vercel CLI: `vercel ai --help`

### "Schema validation failed"

**Cause:** Response doesn't match the defined schema

**Solution:**
1. Check the schema definition for typos
2. Ensure all required fields are present
3. Increase `maxTokens` if the response is cut off
4. Lower `temperature` for more deterministic output

## 📋 Checklist

- [x] Create Vercel AI Gateway key ("Claude-Code-Jev")
- [x] Store in Claude Platform Credential Vaults
- [x] Configure AI_GATEWAY_API_KEY as Environment Variable
- [x] Create Jev integration module
- [x] Add examples for structured decisions
- [x] Add examples for regular Claude usage
- [x] Document architecture and usage
- [ ] Add comprehensive test suite
- [ ] Add CI/CD pipeline
- [ ] Deploy to production

## 🤝 Contributing

Contributions welcome! Please ensure:
- Code follows existing style
- Examples are well-documented
- All tests pass: `npm test`
- Security practices are followed

## 📄 License

MIT

---

**Created:** October 5, 2026
**Last Updated:** October 5, 2026
**Author:** Alan More
