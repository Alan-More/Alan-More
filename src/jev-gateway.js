/**
 * Jev Gateway Client
 *
 * This module configures a client for Jev decision-making through the Vercel AI Gateway.
 * It runs structured decisions independently from Claude's main Anthropic client.
 *
 * Usage:
 *   - Claude Code continues using Anthropic API normally (ANTHROPIC_BASE_URL = api.anthropic.com)
 *   - Jev handles structured/non-deterministic decisions via Vercel AI Gateway
 *   - Both APIs are independent and can be used together in the same application
 */

import Anthropic from "@anthropic-ai/sdk";

const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh";
const AI_GATEWAY_DEFAULT_MODEL = "anthropic/claude-opus-5-5";
const GATEWAY_PROXY_PLACEHOLDER_KEY = "proxy-injected";

/**
 * Creates an Anthropic client configured for Vercel AI Gateway
 * If AI_GATEWAY_API_KEY is not set, a placeholder is sent instead; this relies on
 * an egress proxy (e.g. Claude Code cloud sessions) injecting the real credentials.
 * @returns {Anthropic} Client pointing to Vercel AI Gateway
 */
export function createJevGatewayClient() {
  const apiKey = process.env.AI_GATEWAY_API_KEY || GATEWAY_PROXY_PLACEHOLDER_KEY;

  return new Anthropic({
    apiKey: apiKey,
    baseURL: AI_GATEWAY_BASE_URL,
    // Node's built-in fetch honors HTTPS_PROXY (with NODE_USE_ENV_PROXY=1); the SDK's bundled node-fetch does not
    fetch: globalThis.fetch,
  });
}

/**
 * Creates a standard Anthropic client (default behavior)
 * This client uses the standard Anthropic API (api.anthropic.com)
 * @returns {Anthropic} Standard Anthropic client
 */
export function createStandardAnthropicClient() {
  return new Anthropic({
    // Uses default ANTHROPIC_BASE_URL from environment or api.anthropic.com
  });
}

/**
 * Makes a structured decision using Jev through the Vercel AI Gateway
 * Use this for non-deterministic decisions that need structured output
 *
 * @param {Object} decisionConfig - Configuration for the structured decision
 * @param {string} decisionConfig.prompt - The decision-making prompt
 * @param {Object} decisionConfig.schema - JSON schema defining the expected response structure
 * @param {string} [decisionConfig.model] - Gateway model ID (defaults to anthropic/claude-opus-5-5)
 * @param {number} [decisionConfig.temperature] - Temperature for the decision (0-1)
 * @returns {Promise<Object>} Parsed response matching the schema
 */
export async function makeStructuredDecision(decisionConfig) {
  const {
    prompt,
    schema,
    model = AI_GATEWAY_DEFAULT_MODEL,
    temperature = 0,
  } = decisionConfig;

  try {
    const client = createJevGatewayClient();

    const response = await client.messages.create({
      model: model,
      max_tokens: 1024,
      temperature: temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      system: `You are a decision-making assistant. Respond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`,
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Models sometimes wrap JSON in a ```json fence despite the instructions
    const jsonText = textContent.text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1");
    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error making structured decision:", error.message);
    throw error;
  }
}

/**
 * Makes a regular (non-structured) decision through the Vercel AI Gateway
 * Use this for general conversations and non-structured responses
 *
 * @param {string} prompt - The conversation prompt
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} Response text from Claude
 */
export async function makeRegularDecision(prompt, options = {}) {
  const { model = AI_GATEWAY_DEFAULT_MODEL, temperature = 1 } = options;

  try {
    const client = createJevGatewayClient();

    const response = await client.messages.create({
      model: model,
      max_tokens: options.maxTokens || 2048,
      temperature: temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    return textContent.text;
  } catch (error) {
    console.error("Error making regular decision:", error.message);
    throw error;
  }
}

export default {
  createJevGatewayClient,
  createStandardAnthropicClient,
  makeStructuredDecision,
  makeRegularDecision,
};
