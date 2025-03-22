import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define schemas for the tool parameters
export const captureThoughtSchema = z.object({
  thought: z.string().describe("The content of the current thought"),
  thought_number: z.number().int().positive().describe("Current position in the sequence"),
  total_thoughts: z.number().int().positive().describe("Expected total number of thoughts"),
  next_thought_needed: z.boolean().describe("Whether another thought should follow"),
  stage: z.string().describe("Current thinking stage (e.g., 'Problem Definition', 'Analysis')"),
  is_revision: z.boolean().optional().describe("Whether this revises a previous thought"),
  revises_thought: z.number().int().optional().describe("Number of thought being revised"),
  branch_from_thought: z.number().int().optional().describe("Starting point for a new thought branch"),
  branch_id: z.string().optional().describe("Identifier for the current branch"),
  needs_more_thoughts: z.boolean().optional().describe("Whether additional thoughts are needed"),
  score: z.number().min(0).max(1).optional().describe("Quality score (0.0 to 1.0)"),
  tags: z.array(z.string()).optional().describe("Categories or labels for the thought")
});

// Define the inputSchema type
type InputSchema = {
  type: "object";
  properties: Record<string, {
    type: string;
    description?: string;
    items?: { type: string };
  }>;
  required?: string[];
};

// Utility function to convert Zod schema to inputSchema format
const zodToInputSchema = (schema: z.ZodType<any>): InputSchema => {
  return zodToJsonSchema(schema) as InputSchema;
};

// Define the available tools
export const captureThoughtTool: Tool = {
  name: "capture_thought",
  description: "Stores a new thought in memory and in the thought history.",
  parameters: captureThoughtSchema,
  inputSchema: zodToInputSchema(captureThoughtSchema)
};

export const applyReasoningSchema = z.object({
  thought_id: z.number().int().positive().describe("The ID (thought number) of the thought to analyze"),
  reasoning_type: z.string().optional().describe("Optional specific reasoning type to apply")
});

export const applyReasoningTool: Tool = {
  name: "apply_reasoning",
  description: "Applies a reasoning strategy to a given thought in memory.",
  parameters: applyReasoningSchema,
  inputSchema: zodToInputSchema(applyReasoningSchema)
};

export const evaluateThoughtQualitySchema = z.object({
  thought_id: z.number().int().positive().describe("The ID (thought number) of the thought to evaluate")
});

export const evaluateThoughtQualityTool: Tool = {
  name: "evaluate_thought_quality",
  description: "Runs a metacognitive quality check on the specified thought.",
  parameters: evaluateThoughtQualitySchema,
  inputSchema: zodToInputSchema(evaluateThoughtQualitySchema)
};

export const retrieveRelevantThoughtsSchema = z.object({
  thought_id: z.number().int().positive().describe("The ID of the thought to find related thoughts for")
});

export const retrieveRelevantThoughtsTool: Tool = {
  name: "retrieve_relevant_thoughts",
  description: "Finds thoughts from long-term storage that share tags with the specified thought.",
  parameters: retrieveRelevantThoughtsSchema,
  inputSchema: zodToInputSchema(retrieveRelevantThoughtsSchema)
};

export const branchThoughtSchema = z.object({
  parent_thought_id: z.number().int().positive().describe("The ID of the parent thought to branch from"),
  branch_id: z.string().describe("Identifier for the new branch")
});

export const branchThoughtTool: Tool = {
  name: "branch_thought",
  description: "Creates or handles branching from a parent thought.",
  parameters: branchThoughtSchema,
  inputSchema: zodToInputSchema(branchThoughtSchema)
};

export const composedThinkTool: Tool = {
  name: "composed_think",
  description: "Performs the entire thinking pipeline in one operation (capture, reasoning, evaluation, and retrieval).",
  parameters: captureThoughtSchema,
  inputSchema: zodToInputSchema(captureThoughtSchema)
};

export const emptySchema = z.object({});

export const getThinkingSummaryTool: Tool = {
  name: "get_thinking_summary",
  description: "Generate a comprehensive summary of the entire thinking process.",
  parameters: emptySchema,
  inputSchema: zodToInputSchema(emptySchema)
};

export const clearThinkingHistoryTool: Tool = {
  name: "clear_thinking_history",
  description: "Clear all recorded thoughts and reset the server state.",
  parameters: emptySchema,
  inputSchema: zodToInputSchema(emptySchema)
};

// Export all tools as an array for convenience
export const toolDefinitions = [
  captureThoughtTool,
  applyReasoningTool,
  evaluateThoughtQualityTool,
  retrieveRelevantThoughtsTool,
  branchThoughtTool,
  composedThinkTool,
  getThinkingSummaryTool,
  clearThinkingHistoryTool
];