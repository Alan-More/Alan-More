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

export const JEV_GATEWAY_BASE_URL =
  process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh";

// Vercel AI Gateway model ids are provider-prefixed (e.g. "anthropic/<model>")
export const JEV_DEFAULT_MODEL =
  process.env.JEV_MODEL || "anthropic/claude-opus-5.5";

/**
 * Creates an Anthropic client configured for Vercel AI Gateway
 *
 * Auth modes:
 *   - AI_GATEWAY_API_KEY set (local dev): sent as `Authorization: Bearer <key>`
 *   - Not set (Claude Code cloud): no auth header is sent by the SDK; the
 *     platform's API credential injects `Authorization: Bearer <key>` for
 *     ai-gateway.vercel.sh at the network proxy
 *
 * apiKey/authToken are passed explicitly so the SDK never falls back to
 * ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN and leaks them to the gateway.
 *
 * @returns {Anthropic} Client pointing to Vercel AI Gateway
 */
export function createJevGatewayClient() {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;

  if (gatewayKey) {
    return new Anthropic({
      apiKey: null,
      authToken: gatewayKey,
      baseURL: JEV_GATEWAY_BASE_URL,
    });
  }

  return new ProxyAuthAnthropic({
    apiKey: null,
    authToken: null,
    baseURL: JEV_GATEWAY_BASE_URL,
  });
}

/**
 * Anthropic client that sends no auth header of its own, for when the
 * network proxy injects the gateway credential. The SDK otherwise refuses
 * to send a request without apiKey or authToken.
 */
class ProxyAuthAnthropic extends Anthropic {
  validateHeaders() {}
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
 * @param {string} [decisionConfig.model] - Gateway model id (defaults to JEV_DEFAULT_MODEL)
 * @param {number} [decisionConfig.temperature] - Temperature for the decision (0-1)
 * @returns {Promise<Object>} Parsed response matching the schema
 */
export async function makeStructuredDecision(decisionConfig) {
  const {
    prompt,
    schema,
    model = JEV_DEFAULT_MODEL,
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

    const result = JSON.parse(textContent.text);
    return result;
  } catch (error) {
    console.error("Error making structured decision:", error.message);
    throw error;
  }
}

/**
 * Makes a regular (non-structured) decision using standard Anthropic API
 * Use this for general conversations and non-structured responses
 *
 * @param {string} prompt - The conversation prompt
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} Response text from Claude
 */
export async function makeRegularDecision(prompt, options = {}) {
  const { model = "claude-opus-5-5", temperature = 1 } = options;

  try {
    const client = createStandardAnthropicClient();

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
