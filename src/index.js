/**
 * Alan-More: Jev Integration Main Entry Point
 *
 * This module exports the main Jev integration functions and clients
 * for use throughout the application.
 */

export {
  createJevGatewayClient,
  createStandardAnthropicClient,
  makeStructuredDecision,
  makeRegularDecision,
} from "./jev-gateway.js";

// Re-export example functions for convenience
export {
  classifySentiment,
  classifyPriority,
  validateDataQuality,
} from "./examples/jev-structured-decision.js";

export {
  askQuestion,
  generateCode,
  summarizeText,
} from "./examples/normal-claude-usage.js";

// Default export
import * as jevGateway from "./jev-gateway.js";
export default jevGateway;
