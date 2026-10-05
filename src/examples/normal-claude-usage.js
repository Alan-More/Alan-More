/**
 * Example: Normal Claude Usage (Standard Anthropic API)
 *
 * This example shows how Claude Code continues to use the standard Anthropic API
 * for regular conversations and general tasks.
 *
 * Claude Code uses:
 *   - ANTHROPIC_BASE_URL = https://api.anthropic.com (default)
 *   - No changes to normal operation
 *
 * Run: node src/examples/normal-claude-usage.js
 */

import { makeRegularDecision } from "../jev-gateway.js";

async function askQuestion() {
  console.log("💬 Example 1: Regular Question\n");

  try {
    const response = await makeRegularDecision(
      "What are the three most important principles of software architecture? Keep it concise."
    );

    console.log("✅ Response:");
    console.log(response);
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function generateCode() {
  console.log("💬 Example 2: Code Generation\n");

  try {
    const response = await makeRegularDecision(
      "Write a simple JavaScript function that validates an email address."
    );

    console.log("✅ Response:");
    console.log(response);
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function summarizeText() {
  console.log("💬 Example 3: Text Summarization\n");

  try {
    const response = await makeRegularDecision(
      "Summarize this in 2 sentences: Machine learning is a subset of artificial intelligence that focuses on enabling systems to learn from data without being explicitly programmed. It uses algorithms and statistical models to identify patterns and make predictions or decisions based on input data."
    );

    console.log("✅ Response:");
    console.log(response);
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function runExamples() {
  console.log("═══════════════════════════════════════════════");
  console.log("   Normal Claude Usage Examples");
  console.log("═══════════════════════════════════════════════\n");

  console.log("ℹ️  These examples use the standard Anthropic API");
  console.log("ℹ️  ANTHROPIC_BASE_URL remains api.anthropic.com\n");

  // Run examples sequentially
  await askQuestion();
  await generateCode();
  await summarizeText();

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

export { askQuestion, generateCode, summarizeText };
