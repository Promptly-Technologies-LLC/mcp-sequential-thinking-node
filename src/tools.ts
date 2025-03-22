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

export const retrieveRelevantThoughtsSchema = z.object({
  thought_id: z.number().int().positive().describe("The ID of the thought to find related thoughts for")
});

export const reviseThoughtSchema = captureThoughtSchema.extend({
  thought_id: z.number().int().positive().describe("The ID of the thought to revise")
}).partial().required({ thought_id: true });

export const captureThoughtTool: Tool = {
  name: "capture_thought",
  description: "Stores a new thought in memory and in the thought history and runs a pipeline to classify the thought, return metacognitive feedback, and retrieve relevant thoughts.",
  parameters: captureThoughtSchema,
  inputSchema: zodToInputSchema(captureThoughtSchema)
};

export const reviseThoughtTool: Tool = {
  name: "revise_thought",
  description: "Revises a thought in memory and in the thought history.",
  parameters: reviseThoughtSchema,
  inputSchema: zodToInputSchema(reviseThoughtSchema)
};

export const retrieveRelevantThoughtsTool: Tool = {
  name: "retrieve_relevant_thoughts",
  description: "Finds thoughts from long-term storage that share tags with the specified thought.",
  parameters: retrieveRelevantThoughtsSchema,
  inputSchema: zodToInputSchema(retrieveRelevantThoughtsSchema)
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
  reviseThoughtTool,
  retrieveRelevantThoughtsTool,
  getThinkingSummaryTool,
  clearThinkingHistoryTool
];