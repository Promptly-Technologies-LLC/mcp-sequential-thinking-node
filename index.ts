#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DateTime } from "luxon";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// Enum for thought stages
export enum ThoughtStage {
  PROBLEM_DEFINITION = "Problem Definition",
  PLAN = "Plan",
  RESEARCH = "Research",
  ANALYSIS = "Analysis",
  IDEATION = "Ideation",
  SYNTHESIS = "Synthesis",
  EVALUATION = "Evaluation",
  REFINEMENT = "Refinement",
  IMPLEMENTATION = "Implementation",
  CONCLUSION = "Conclusion"
}

// Helper to convert string to ThoughtStage
function thoughtStageFromString(value: string): ThoughtStage {
  // Try direct conversion first
  if (Object.values(ThoughtStage).includes(value as ThoughtStage)) {
    return value as ThoughtStage;
  }

  // Try case-insensitive match with enum names
  const upperValue = value.toUpperCase();
  for (const stageName of Object.keys(ThoughtStage)) {
    if (stageName.toUpperCase() === upperValue) {
      return ThoughtStage[stageName as keyof typeof ThoughtStage];
    }
  }

  // Try matching the value part
  for (const stageValue of Object.values(ThoughtStage)) {
    if (stageValue.toUpperCase() === upperValue) {
      return stageValue as ThoughtStage;
    }
  }

  // If no match found, throw error
  throw new Error(`Invalid stage: ${value}. Valid stages are: ${Object.values(ThoughtStage).join(", ")}`);
}

// Data structures
interface CognitiveContext {
  workingMemory: Record<string, any>;
  longTermMemory: Record<string, any>;
  attentionFocus: string | null;
  confidenceLevel: number;
  reasoningChain: string[];
  timestamp: DateTime;
  contextTags: string[];
}

interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  stage: ThoughtStage;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  score?: number;
  tags: string[];
  createdAt: DateTime;
}

interface EnhancedThoughtData extends ThoughtData {
  context: CognitiveContext;
  dependencies: number[];
  confidenceScore: number;
  reasoningType: string;
  metacognitionNotes: string[];
  priority: number;
  complexity: number;
}

// Classes for memory management, reasoning, and metacognition
class MemoryManager {
  private shortTermBuffer: ThoughtData[] = [];
  private longTermStorage: Record<string, ThoughtData[]> = {};
  private importanceThreshold: number = 0.7;
  private maxBufferSize: number = 10;

  consolidateMemory(thought: ThoughtData): void {
    this.shortTermBuffer.push(thought);
    
    if (this.shortTermBuffer.length > this.maxBufferSize) {
      this.processBuffer();
    }
    
    if (thought.score && thought.score >= this.importanceThreshold) {
      const category = thought.stage;
      if (!this.longTermStorage[category]) {
        this.longTermStorage[category] = [];
      }
      this.longTermStorage[category].push(thought);
    }
  }

  private processBuffer(): void {
    this.shortTermBuffer = this.shortTermBuffer.slice(-this.maxBufferSize);
  }

  retrieveRelevantThoughts(currentThought: ThoughtData): ThoughtData[] {
    const relevant: ThoughtData[] = [];
    for (const thoughts of Object.values(this.longTermStorage)) {
      for (const thought of thoughts) {
        if (thought.tags.some(tag => currentThought.tags.includes(tag))) {
          relevant.push(thought);
        }
      }
    }
    return relevant;
  }

  clear(): void {
    this.shortTermBuffer = [];
    this.longTermStorage = {};
  }
}

class ReasoningEngine {
  private reasoningPatterns: Record<string, (thought: ThoughtData) => ThoughtData> = {
    deductive: this.applyDeductiveReasoning.bind(this),
    inductive: this.applyInductiveReasoning.bind(this),
    abductive: this.applyAbductiveReasoning.bind(this),
    analogical: this.applyAnalogicalReasoning.bind(this),
    creative: this.applyCreativeReasoning.bind(this)
  };

  applyDeductiveReasoning(thought: ThoughtData): ThoughtData {
    thought.tags.push("deductive");
    return thought;
  }

  applyInductiveReasoning(thought: ThoughtData): ThoughtData {
    thought.tags.push("inductive");
    return thought;
  }

  applyAbductiveReasoning(thought: ThoughtData): ThoughtData {
    thought.tags.push("abductive");
    return thought;
  }

  applyAnalogicalReasoning(thought: ThoughtData): ThoughtData {
    thought.tags.push("analogical");
    return thought;
  }

  applyCreativeReasoning(thought: ThoughtData): ThoughtData {
    thought.tags.push("creative");
    return thought;
  }

  analyzeThoughtPattern(thought: ThoughtData): string {
    // Simple pattern matching based on stage
    if (thought.stage === ThoughtStage.ANALYSIS || thought.stage === ThoughtStage.EVALUATION) {
      return "deductive";
    } else if (thought.stage === ThoughtStage.IDEATION) {
      return "creative";
    } else if (thought.stage === ThoughtStage.SYNTHESIS) {
      return "inductive";
    }
    return "deductive";
  }

  applyReasoningStrategy(thought: ThoughtData): ThoughtData {
    const pattern = this.analyzeThoughtPattern(thought);
    return this.reasoningPatterns[pattern](thought);
  }
}

class MetacognitiveMonitor {
  private qualityMetrics = {
    coherence: 0.0,
    depth: 0.0,
    creativity: 0.0,
    practicality: 0.0,
    relevance: 0.0,
    clarity: 0.0
  };

  evaluateThoughtQuality(thought: ThoughtData): Record<string, number> {
    const metrics = { ...this.qualityMetrics };
    
    // Basic metric calculation
    if (thought.score) {
      const baseScore = thought.score;
      metrics.coherence = baseScore;
      metrics.depth = baseScore * 0.8;
      metrics.creativity = baseScore * 0.7;
      metrics.practicality = baseScore * 0.9;
      metrics.relevance = baseScore * 0.85;
      metrics.clarity = baseScore * 0.95;
    }
    
    // Adjust based on stage
    if (thought.stage === ThoughtStage.IDEATION) {
      metrics.creativity *= 1.2;
    } else if (thought.stage === ThoughtStage.EVALUATION) {
      metrics.practicality *= 1.2;
    }
    
    return metrics;
  }

  generateImprovementSuggestions(metrics: Record<string, number>): string[] {
    const suggestions: string[] = [];
    for (const [metric, value] of Object.entries(metrics)) {
      if (value < 0.7) {
        if (metric === "coherence") {
          suggestions.push("Consider strengthening logical connections");
        } else if (metric === "depth") {
          suggestions.push("Try exploring the concept more thoroughly");
        } else if (metric === "creativity") {
          suggestions.push("Consider adding more innovative elements");
        } else if (metric === "practicality") {
          suggestions.push("Focus on practical applications");
        } else if (metric === "relevance") {
          suggestions.push("Ensure alignment with main objectives");
        } else if (metric === "clarity") {
          suggestions.push("Try expressing ideas more clearly");
        }
      }
    }
    return suggestions;
  }

  suggestImprovements(thought: ThoughtData): string[] {
    const metrics = this.evaluateThoughtQuality(thought);
    return this.generateImprovementSuggestions(metrics);
  }
}

class SequentialThinkingServer {
  protected thoughtHistory: ThoughtData[] = [];
  protected branches: Record<string, ThoughtData[]> = {};
  protected activeBranchId: string | null = null;

  protected validateThoughtData(inputData: any): ThoughtData {
    try {
      // Convert stage string to enum
      const stage = thoughtStageFromString(inputData.stage);
      
      const thoughtData: ThoughtData = {
        thought: inputData.thought,
        thoughtNumber: inputData.thoughtNumber,
        totalThoughts: inputData.totalThoughts,
        nextThoughtNeeded: inputData.nextThoughtNeeded,
        stage: stage,
        isRevision: inputData.isRevision,
        revisesThought: inputData.revisesThought,
        branchFromThought: inputData.branchFromThought,
        branchId: inputData.branchId,
        needsMoreThoughts: inputData.needsMoreThoughts,
        score: inputData.score,
        tags: inputData.tags || [],
        createdAt: DateTime.now()
      };
      
      // Validate the created thought data
      this.validateThought(thoughtData);
      return thoughtData;
      
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Invalid thought data: ${e.message}`);
      }
      throw new Error(`Invalid thought data: Unknown error`);
    }
  }

  protected validateThought(thought: ThoughtData): void {
    if (thought.thoughtNumber < 1) {
      throw new Error("Thought number must be positive");
    }
    if (thought.totalThoughts < thought.thoughtNumber) {
      throw new Error("Total thoughts must be greater than or equal to thought number");
    }
    if (thought.score !== undefined && (thought.score < 0 || thought.score > 1)) {
      throw new Error("Score must be between 0 and 1");
    }
    if (thought.revisesThought !== undefined && thought.revisesThought >= thought.thoughtNumber) {
      throw new Error("Cannot revise a future thought");
    }
  }

  generateSummary(): string {
    if (!this.thoughtHistory.length) {
      return JSON.stringify({ summary: "No thoughts recorded yet" });
    }
    
    const stages: Record<string, ThoughtData[]> = {};
    for (const thought of this.thoughtHistory) {
      const stageName = thought.stage;
      if (!stages[stageName]) {
        stages[stageName] = [];
      }
      stages[stageName].push(thought);
    }
    
    // Calculate various metrics
    const summary = {
      totalThoughts: this.thoughtHistory.length,
      stages: Object.entries(stages).reduce((acc, [stage, thoughts]) => {
        acc[stage] = {
          count: thoughts.length,
          averageScore: thoughts.reduce((sum, t) => sum + (t.score || 0), 0) / thoughts.length
        };
        return acc;
      }, {} as Record<string, { count: number, averageScore: number }>),
      branches: Object.entries(this.branches).reduce((acc, [branchId, thoughts]) => {
        acc[branchId] = thoughts.length;
        return acc;
      }, {} as Record<string, number>),
      revisions: this.thoughtHistory.filter(t => t.isRevision).length,
      timeline: this.thoughtHistory.map(t => ({
        number: t.thoughtNumber,
        stage: t.stage,
        score: t.score,
        branch: t.branchId
      }))
    };
    
    return JSON.stringify({ summary }, null, 2);
  }
}

class EnhancedSequentialThinkingServer extends SequentialThinkingServer {
  private memoryManager = new MemoryManager();
  private reasoningEngine = new ReasoningEngine();
  private metacognitiveMonitor = new MetacognitiveMonitor();
  
  processThought(inputData: any): any {
    try {
      // Validate and create thought data
      const thoughtData = this.validateThoughtData(inputData);
      
      // Apply reasoning strategy
      const enhancedThought = this.reasoningEngine.applyReasoningStrategy(thoughtData);
      
      // Store in memory
      this.memoryManager.consolidateMemory(enhancedThought);
      
      // Get metacognitive insights
      const improvements = this.metacognitiveMonitor.suggestImprovements(enhancedThought);
      
      // Get related thoughts
      const relatedThoughts = this.memoryManager.retrieveRelevantThoughts(enhancedThought);
      
      // Store thought in history
      this.thoughtHistory.push(enhancedThought);
      
      // Handle branching
      if (enhancedThought.branchFromThought && enhancedThought.branchId) {
        if (!this.branches[enhancedThought.branchId]) {
          this.branches[enhancedThought.branchId] = [];
        }
        this.branches[enhancedThought.branchId].push(enhancedThought);
      }
      
      // Enhanced response format
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtAnalysis: {
              currentThought: {
                thoughtNumber: enhancedThought.thoughtNumber,
                totalThoughts: enhancedThought.totalThoughts,
                nextThoughtNeeded: enhancedThought.nextThoughtNeeded,
                stage: enhancedThought.stage,
                score: enhancedThought.score,
                tags: enhancedThought.tags,
                timestamp: enhancedThought.createdAt.toISO(),
                branch: enhancedThought.branchId
              },
              analysis: {
                relatedThoughtsCount: relatedThoughts.length,
                qualityMetrics: this.metacognitiveMonitor.evaluateThoughtQuality(enhancedThought),
                suggestedImprovements: improvements
              },
              context: {
                activeBranches: Object.keys(this.branches),
                thoughtHistoryLength: this.thoughtHistory.length,
                currentStage: enhancedThought.stage
              }
            }
          }, null, 2)
        }]
      };
      
    } catch (e) {
      console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: e instanceof Error ? e.message : String(e),
            status: "failed",
            errorType: e instanceof Error ? e.constructor.name : "Unknown",
            timestamp: DateTime.now().toISO()
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  clearHistory(): void {
    this.thoughtHistory = [];
    this.branches = {};
    this.memoryManager.clear();
    this.activeBranchId = null;
  }
}

// Define schemas for the tool parameters
const SequentialThinkingSchema = z.object({
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

// Create and configure the MCP server
function createServer() {
  const server = new Server(
    {
      name: "sequential-thinking",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const thinkingServer = new EnhancedSequentialThinkingServer();
  
  // Define the available tools
  const toolDefinitions = [
    {
      name: "sequential_thinking",
      description: "An advanced tool for dynamic and reflective problem-solving through structured thoughts.",
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

  // Handle the ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { params } = request;
    
    switch (params.name) {
      case "sequential_thinking": {
        // Type assertion for the parameters
        const toolParams = params.parameters as z.infer<typeof SequentialThinkingSchema>;
        
        const inputData = {
          thought: toolParams.thought,
          thoughtNumber: toolParams.thought_number,
          totalThoughts: toolParams.total_thoughts,
          nextThoughtNeeded: toolParams.next_thought_needed,
          stage: toolParams.stage,
          isRevision: toolParams.is_revision,
          revisesThought: toolParams.revises_thought,
          branchFromThought: toolParams.branch_from_thought,
          branchId: toolParams.branch_id,
          needsMoreThoughts: toolParams.needs_more_thoughts,
          score: toolParams.score,
          tags: toolParams.tags || []
        };
        
        const result = thinkingServer.processThought(inputData);
        return {
          content: result.content
        };
      }
      
      case "get_thinking_summary": {
        return {
          content: [{
            type: "text",
            text: thinkingServer.generateSummary()
          }]
        };
      }
      
      case "clear_thinking_history": {
        thinkingServer.clearHistory();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "success",
              message: "Thinking history cleared"
            })
          }]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${params.name}`);
    }
  });

  return server;
}

// Main entry point
export async function main() {
  console.log("Sequential Thinking Server Starting...");
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Run the server if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  try {
    console.log("Sequential Thinking Server");
    console.log("Version: 1.0.0");
    console.log("Available stages:", Object.values(ThoughtStage).join(", "));
    main().catch(e => {
      console.error(`Fatal Error: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    });
  } catch (e) {
    console.error(`Fatal Error: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

export { createServer }; 