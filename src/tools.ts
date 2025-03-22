import { z } from "zod";

// Define schemas for the tool parameters
export const SequentialThinkingSchema = z.object({
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

// Define the available tools
export const toolDefinitions = [
  {
    name: "capture_thought",
    description: "Stores a new thought in memory and in the thought history.",
    parameters: z.object({
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
    }),
    inputSchema: {
      type: "object",
      properties: {
        thought: { type: "string", description: "The content of the current thought" },
        thought_number: { type: "integer", description: "Current position in the sequence" },
        total_thoughts: { type: "integer", description: "Expected total number of thoughts" },
        next_thought_needed: { type: "boolean", description: "Whether another thought should follow" },
        stage: { type: "string", description: "Current thinking stage (e.g., 'Problem Definition', 'Analysis')" },
        is_revision: { type: "boolean", description: "Whether this revises a previous thought" },
        revises_thought: { type: "integer", description: "Number of thought being revised" },
        branch_from_thought: { type: "integer", description: "Starting point for a new thought branch" },
        branch_id: { type: "string", description: "Identifier for the current branch" },
        needs_more_thoughts: { type: "boolean", description: "Whether additional thoughts are needed" },
        score: { type: "number", description: "Quality score (0.0 to 1.0)" },
        tags: { type: "array", items: { type: "string" }, description: "Categories or labels for the thought" }
      },
      required: ["thought", "thought_number", "total_thoughts", "next_thought_needed", "stage"]
    }
  },
  {
    name: "apply_reasoning",
    description: "Applies a reasoning strategy to a given thought in memory.",
    parameters: z.object({
      thought_id: z.number().int().positive().describe("The ID (thought number) of the thought to analyze"),
      reasoning_type: z.string().optional().describe("Optional specific reasoning type to apply")
    }),
    inputSchema: {
      type: "object",
      properties: {
        thought_id: { type: "integer", description: "The ID (thought number) of the thought to analyze" },
        reasoning_type: { type: "string", description: "Optional specific reasoning type to apply" }
      },
      required: ["thought_id"]
    }
  },
  {
    name: "evaluate_thought_quality",
    description: "Runs a metacognitive quality check on the specified thought.",
    parameters: z.object({
      thought_id: z.number().int().positive().describe("The ID (thought number) of the thought to evaluate")
    }),
    inputSchema: {
      type: "object",
      properties: {
        thought_id: { type: "integer", description: "The ID (thought number) of the thought to evaluate" }
      },
      required: ["thought_id"]
    }
  },
  {
    name: "retrieve_relevant_thoughts",
    description: "Finds thoughts from long-term storage that share tags with the specified thought.",
    parameters: z.object({
      thought_id: z.number().int().positive().describe("The ID of the thought to find related thoughts for")
    }),
    inputSchema: {
      type: "object",
      properties: {
        thought_id: { type: "integer", description: "The ID of the thought to find related thoughts for" }
      },
      required: ["thought_id"]
    }
  },
  {
    name: "branch_thought",
    description: "Creates or handles branching from a parent thought.",
    parameters: z.object({
      parent_thought_id: z.number().int().positive().describe("The ID of the parent thought to branch from"),
      branch_id: z.string().describe("Identifier for the new branch")
    }),
    inputSchema: {
      type: "object",
      properties: {
        parent_thought_id: { type: "integer", description: "The ID of the parent thought to branch from" },
        branch_id: { type: "string", description: "Identifier for the new branch" }
      },
      required: ["parent_thought_id", "branch_id"]
    }
  },
  {
    name: "composed_think",
    description: "Performs the entire thinking pipeline in one operation (capture, reasoning, evaluation, and retrieval).",
    parameters: SequentialThinkingSchema,
    inputSchema: {
      type: "object",
      properties: {
        thought: { type: "string", description: "The content of the current thought" },
        thought_number: { type: "integer", description: "Current position in the sequence" },
        total_thoughts: { type: "integer", description: "Expected total number of thoughts" },
        next_thought_needed: { type: "boolean", description: "Whether another thought should follow" },
        stage: { type: "string", description: "Current thinking stage (e.g., 'Problem Definition', 'Analysis')" },
        is_revision: { type: "boolean", description: "Whether this revises a previous thought" },
        revises_thought: { type: "integer", description: "Number of thought being revised" },
        branch_from_thought: { type: "integer", description: "Starting point for a new thought branch" },
        branch_id: { type: "string", description: "Identifier for the current branch" },
        needs_more_thoughts: { type: "boolean", description: "Whether additional thoughts are needed" },
        score: { type: "number", description: "Quality score (0.0 to 1.0)" },
        tags: { type: "array", items: { type: "string" }, description: "Categories or labels for the thought" }
      },
      required: ["thought", "thought_number", "total_thoughts", "next_thought_needed", "stage"]
    }
  },
  {
    name: "get_thinking_summary",
    description: "Generate a comprehensive summary of the entire thinking process.",
    parameters: z.object({}),
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "clear_thinking_history",
    description: "Clear all recorded thoughts and reset the server state.",
    parameters: z.object({}),
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];