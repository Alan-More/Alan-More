/**
 * Jev Gateway Client
 *
 * This module configures clients for the Vercel AI Gateway: TypeSafe Jev (typesafe-ai/jev)
 * for structured decisions and Claude (anthropic/claude-opus-5-5) for regular decisions.
 *
 * Usage:
 *   - Claude Code itself continues using the Anthropic API normally
 *   - makeStructuredDecision and makeRegularDecision both go through Vercel AI Gateway
 *   - createStandardAnthropicClient (direct api.anthropic.com) remains available but unused
 */

import Anthropic from "@anthropic-ai/sdk";
import { JevClient } from "@opengeni/jev";

const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh";
const AI_GATEWAY_DEFAULT_MODEL = "anthropic/claude-opus-5-5";
const GATEWAY_PROXY_PLACEHOLDER_KEY = "proxy-injected";
// The gateway serves a TypeSafe-compatible API here: POST /typesafe/v1/systemone
const JEV_GATEWAY_BASE_URL = `${AI_GATEWAY_BASE_URL}/typesafe`;
const JEV_MODEL = "typesafe-ai/jev";

function getGatewayApiKey() {
  return process.env.AI_GATEWAY_API_KEY || GATEWAY_PROXY_PLACEHOLDER_KEY;
}

/**
 * Creates an Anthropic client configured for Vercel AI Gateway
 * If AI_GATEWAY_API_KEY is not set, a placeholder is sent instead; this relies on
 * an egress proxy (e.g. Claude Code cloud sessions) injecting the real credentials.
 * @returns {Anthropic} Client pointing to Vercel AI Gateway
 */
export function createJevGatewayClient() {
  return new Anthropic({
    apiKey: getGatewayApiKey(),
    baseURL: AI_GATEWAY_BASE_URL,
    // Node's built-in fetch honors HTTPS_PROXY (with NODE_USE_ENV_PROXY=1); the SDK's bundled node-fetch does not
    fetch: globalThis.fetch,
  });
}

/**
 * Creates a TypeSafe Jev client that reaches typesafe-ai/jev through Vercel AI Gateway
 * Uses the same AI_GATEWAY_API_KEY / proxy-injected credentials as the Claude client.
 * @returns {JevClient} Jev client pointing to the gateway's TypeSafe-compatible API
 */
export function createJevClient() {
  return new JevClient({
    apiKey: getGatewayApiKey(),
    baseUrl: JEV_GATEWAY_BASE_URL,
    model: JEV_MODEL,
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
 * Makes a structured decision using Jev (typesafe-ai/jev) through the Vercel AI Gateway
 * Jev answers typed questions about a shared state; it does not generate free-form text.
 *
 * Question types:
 *   - choice: { type: "choice", instructions, criteria: { optionA: null | "when to pick it", ... } }
 *   - noul:   { type: "noul", instructions, criteria?: { true?, false? } } (probability of "yes")
 *   - score:  { type: "score", instructions, criteria: [...] }
 *
 * @param {Object} decisionConfig - Configuration for the structured decision
 * @param {string|Object} decisionConfig.state - The situation being judged (text or JSON)
 * @param {Object} decisionConfig.questions - Named Jev questions, e.g. { sentiment: {...} }
 * @returns {Promise<Object>} { answers, model, usage, requests, costUsd }; for a choice answer,
 *   answers.<name> is { type: "choice", option, probabilities?, confidence? }
 */
export async function makeStructuredDecision(decisionConfig) {
  const { state, questions } = decisionConfig;

  try {
    const jev = createJevClient();
    return await jev.ask(state, questions);
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
  createJevClient,
  createStandardAnthropicClient,
  makeStructuredDecision,
  makeRegularDecision,
};
