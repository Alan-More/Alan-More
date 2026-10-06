/**
 * Example: Structured Decision with Jev
 *
 * This example shows how to use Jev (typesafe-ai/jev) through the Vercel AI Gateway
 * for typed decisions: choice options and yes/no probabilities.
 *
 * Run: node src/examples/jev-structured-decision.js
 */

import { makeStructuredDecision } from "../jev-gateway.js";

function printDecision(decision) {
  for (const [name, answer] of Object.entries(decision.answers)) {
    if (answer.type === "choice") {
      console.log(`✅ ${name}: ${answer.option} (confidence ${answer.confidence ?? "n/a"})`);
      if (answer.probabilities) console.log("   probabilities:", answer.probabilities);
    } else if (answer.type === "noul") {
      console.log(`✅ ${name}: P(yes) = ${answer.probability}`);
    } else {
      console.log(`✅ ${name}:`, answer);
    }
  }
  console.log(`   model: ${decision.model}, cost: $${decision.costUsd}\n`);
}

async function classifySentiment() {
  console.log("🎯 Example 1: Sentiment Classification\n");

  try {
    const decision = await makeStructuredDecision({
      state: "Customer review: 'I absolutely love this product! It exceeded my expectations.'",
      questions: {
        sentiment: {
          type: "choice",
          instructions: "What is the overall sentiment of the review?",
          criteria: { positive: null, negative: null, neutral: null },
        },
      },
    });

    printDecision(decision);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function classifyPriority() {
  console.log("🎯 Example 2: Priority Classification\n");

  try {
    const decision = await makeStructuredDecision({
      state: "Support ticket: 'Server is down, no one can access the application'",
      questions: {
        priority: {
          type: "choice",
          instructions: "What priority should this support ticket get?",
          criteria: { critical: null, high: null, medium: null, low: null },
        },
        estimatedResolutionTime: {
          type: "choice",
          instructions: "How soon must this ticket be resolved?",
          criteria: { immediate: null, "within-1h": null, "within-4h": null, "within-24h": null },
        },
        requiresEscalation: {
          type: "noul",
          instructions: "Does this ticket need management escalation?",
        },
      },
    });

    printDecision(decision);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function validateDataQuality() {
  console.log("🎯 Example 3: Data Quality Assessment\n");

  try {
    const decision = await makeStructuredDecision({
      state: {
        customerRecord: {
          name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          country: "US",
        },
      },
      questions: {
        overallQuality: {
          type: "choice",
          instructions: "How good is the data quality of this customer record?",
          criteria: { excellent: null, good: null, fair: null, poor: null },
        },
        looksLikeTestData: {
          type: "noul",
          instructions: "Does this record look like placeholder or test data rather than a real customer?",
        },
      },
    });

    printDecision(decision);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function runExamples() {
  console.log("═══════════════════════════════════════════════");
  console.log("   Jev Structured Decision Examples");
  console.log("═══════════════════════════════════════════════\n");

  console.log("ℹ️  These examples use Jev (typesafe-ai/jev) through the Vercel AI Gateway\n");

  await classifySentiment();
  await classifyPriority();
  await validateDataQuality();

  console.log("═══════════════════════════════════════════════");
  console.log("✅ All examples completed!");
  console.log("═══════════════════════════════════════════════");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { classifySentiment, classifyPriority, validateDataQuality };
