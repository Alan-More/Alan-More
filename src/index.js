/**
 * Alan-More: Jev Integration Main Entry Point
 */

export {
  createJevGatewayClient,
  createJevClient,
  createStandardAnthropicClient,
  makeStructuredDecision,
  makeRegularDecision,
} from "./jev-gateway.js";

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

import * as jevGateway from "./jev-gateway.js";
export default jevGateway;
