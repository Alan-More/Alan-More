/**
 * Example: Structured Decision with Jev
 *
 * This example shows how to use Jev through the Vercel AI Gateway
 * for structured, deterministic decisions with guaranteed schema compliance.
 *
 * Run: node src/examples/jev-structured-decision.js
 */

import { makeStructuredDecision } from "../jev-gateway.js";

async function classifySentiment() {
  console.log("🎯 Example 1: Sentiment Classification\n");

  try {
    const decision = await makeStructuredDecision({
      prompt:
        "Analyze the sentiment of this text: 'I absolutely love this product! It exceeded my expectations.'",
      schema: {
        type: "object",
        properties: {
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "neutral"],
            description: "The overall sentiment",
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence score (0-1)",
          },
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "Key emotion words identified",
          },
        },
        required: ["sentiment", "confidence", "keywords"],
      },
    });

    console.log("✅ Decision:", decision);
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function classifyPriority() {
  console.log("🎯 Example 2: Priority Classification\n");

  try {
    const decision = await makeStructuredDecision({
      prompt:
        "Classify the priority of this support ticket: 'Server is down, no one can access the application'",
      schema: {
        type: "object",
        properties: {
          priority: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
            description: "Ticket priority level",
          },
          estimatedResolutionTime: {
            type: "string",
            enum: ["immediate", "within-1h", "within-4h", "within-24h"],
            description: "Estimated time to resolution",
          },
          requiresEscalation: {
            type: "boolean",
            description: "Whether this needs management escalation",
          },
          recommendedActions: {
            type: "array",
            items: { type: "string" },
            description: "Recommended immediate actions",
          },
        },
        required: [
          "priority",
          "estimatedResolutionTime",
          "requiresEscalation",
          "recommendedActions",
        ],
      },
    });

    console.log("✅ Decision:", decision);
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function validateDataQuality() {
  console.log("🎯 Example 3: Data Quality Assessment\n");

  try {
    const decision = await makeStructuredDecision({
      prompt:
        "Assess the data quality of this customer record: { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', country: 'US' }",
      schema: {
        type: "object",
        properties: {
          overallQuality: {
            type: "string",
            enum: ["excellent", "good", "fair", "poor"],
            description: "Overall data quality assessment",
          },
          completeness: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Percentage of required fields filled",
          },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                issue: { type: "string" },
              },
            },
            description: "List of identified data quality issues",
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Recommendations for improvement",
          },
        },
        required: [
          "overallQuality",
          "completeness",
          "issues",
          "recommendations",
        ],
      },
    });

    console.log("✅ Decision:", decision);
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function runExamples() {
  console.log("═══════════════════════════════════════════════");
  console.log("   Jev Structured Decision Examples");
  console.log("═══════════════════════════════════════════════\n");

  console.log("ℹ️  These examples use Jev through the Vercel AI Gateway");
  console.log("ℹ️  Requires AI_GATEWAY_API_KEY to be set\n");

  // Run examples sequentially
  await classifySentiment();
  await classifyPriority();
  await validateDataQuality();

  console.log("═══════════════════════════════════════════════");
  console.log("✅ All examples completed!");
  console.log("═══════════════════════════════════════════════");
}

// Run examples if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { classifySentiment, classifyPriority, validateDataQuality };
