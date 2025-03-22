#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { EnhancedSequentialThinkingServer } from "./src/SequentialThinkingServer.js";
import { toolDefinitions, SequentialThinkingSchema } from "./src/tools.js";

// Create and configure the MCP server
function createServer() {
  const server = new Server(
    {
      name: "structured-thinking",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {
          list: true,
          call: true
        }
      }
    }
  );

  const thinkingServer = new EnhancedSequentialThinkingServer();

  // Handle the ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { params } = request;
    
    // Add defensive checks before processing
    if (!params) {
      console.error("ERROR: params object is undefined in request:", request);
      return { 
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Invalid request: params object is undefined",
            status: "failed"
          })
        }],
        isError: true
      };
    }
    
    switch (params.name) {
      case "capture_thought": {
        // Add defensive check for parameters
        if (!params.parameters) {
          console.error("ERROR: params.parameters is undefined in capture_thought request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: parameters object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
        // Type assertion for the parameters
        const captureParams = params.parameters as z.infer<typeof SequentialThinkingSchema>;
        
        const inputData = {
          thought: captureParams.thought,
          thoughtNumber: captureParams.thought_number,
          totalThoughts: captureParams.total_thoughts,
          nextThoughtNeeded: captureParams.next_thought_needed,
          stage: captureParams.stage,
          isRevision: captureParams.is_revision,
          revisesThought: captureParams.revises_thought,
          branchFromThought: captureParams.branch_from_thought,
          branchId: captureParams.branch_id,
          needsMoreThoughts: captureParams.needs_more_thoughts,
          score: captureParams.score,
          tags: captureParams.tags || []
        };
        
        return thinkingServer.captureThought(inputData);
      }
      
      case "apply_reasoning": {
        const { thought_id, reasoning_type } = params.parameters as { thought_id: number; reasoning_type?: string };
        return thinkingServer.applyReasoning({ thought_id, reasoning_type });
      }
      
      case "evaluate_thought_quality": {
        const { thought_id } = params.parameters as { thought_id: number };
        return thinkingServer.evaluateThoughtQuality({ thought_id });
      }
      
      case "retrieve_relevant_thoughts": {
        const { thought_id } = params.parameters as { thought_id: number };
        return thinkingServer.retrieveRelevantThoughts({ thought_id });
      }
      
      case "branch_thought": {
        const { parent_thought_id, branch_id } = params.parameters as { parent_thought_id: number; branch_id: string };
        return thinkingServer.branchThought({ parent_thought_id, branch_id });
      }
      
      case "composed_think": {
        // Add defensive check for parameters
        if (!params.parameters) {
          console.error("ERROR: params.parameters is undefined in composed_think request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: parameters object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
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
        
        return thinkingServer.composedThink(inputData);
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
const server = createServer();
const transport = new StdioServerTransport();
server.connect(transport);

export { createServer }; 