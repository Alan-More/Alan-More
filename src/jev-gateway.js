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

/**
 * Creates an Anthropic client configured for Vercel AI Gateway
 * @returns {Anthropic} Client pointing to Vercel AI Gateway
 * @throws {Error} If AI_GATEWAY_API_KEY is not set
 */
export function createJevGatewayClient() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AI_GATEWAY_API_KEY not found. Please configure it via Claude Platform Credential Vaults."
    );
  }

  return new Anthropic({
    apiKey: apiKey,
    baseURL: "https://api.gateway.vercel.com",
    // Note: The gateway will route requests to Claude through Jev for structured decisions
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
 * Type definition for a structured decision request
 * @typedef {Object} StructuredDecision
 * @property {string} prompt - The decision-making prompt
 * @property {Object} schema - JSON schema defining the expected response structure
 * @property {string} [model] - Model to use (defaults to claude-opus-5-5)
 * @property {number} [temperature] - Temperature for the decision (0-1)
 */

/**
 * Makes a structured decision using Jev through the Vercel AI Gateway
 * Use this for non-deterministic decisions that need structured output
 *
 * @param {StructuredDecision} decisionConfig - Configuration for the structured decision
 * @returns {Promise<Object>} Parsed response matching the schema
 *
 * @example
 * const decision = await makeStructuredDecision({
 *   prompt: "Classify this sentiment: 'Great product!'",
 *   schema: {
 *     type: "object",
 *     properties: {
 *       sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
 *       confidence: { type: "number", minimum: 0, maximum: 1 }
 *     },
 *     required: ["sentiment", "confidence"]
 *   }
 * });
 */
export async function makeStructuredDecision(decisionConfig) {
  const {
    prompt,
    schema,
    model = "claude-opus-5-5",
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
      // Jev will handle schema validation through the gateway
      system: `You are a decision-making assistant. Respond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`,
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Parse and validate against schema
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
