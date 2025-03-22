#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { EnhancedSequentialThinkingServer } from "./src/SequentialThinkingServer.js";
import { toolDefinitions, captureThoughtSchema } from "./src/tools.js";

// Create and configure the MCP server
function createServer() {
  const server = new Server(
    {
      name: "structured-thinking",
      version: "1.0.1"
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
        if (!params.arguments && params.arguments) {
          params.arguments = params.arguments;
        }
        
        if (!params.arguments) {
          console.error("ERROR: arguments are undefined in capture_thought request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: arguments object is defined",
                status: "failed",
                received: JSON.stringify(params)
              })
            }],
            isError: true
          };
        }
        
        // Type assertion for the params.arguments
        const captureParams = params.arguments as z.infer<typeof captureThoughtSchema>;
        
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
        if (!params.arguments) {
          console.error("ERROR: params.arguments object is undefined in apply_reasoning request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: params.arguments object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
        const { thought_id, reasoning_type } = params.arguments as { thought_id: number; reasoning_type?: string };
        return thinkingServer.applyReasoning({ thought_id, reasoning_type });
      }
      
      case "evaluate_thought_quality": {        
        if (!params.arguments) {
          console.error("ERROR: params.arguments object is undefined in evaluate_thought_quality request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: params.arguments object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
        const { thought_id } = params.arguments as { thought_id: number };
        return thinkingServer.evaluateThoughtQuality({ thought_id });
      }
      
      case "retrieve_relevant_thoughts": {        
        if (!params.arguments) {
          console.error("ERROR: params.arguments object is undefined in retrieve_relevant_thoughts request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: params.arguments object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
        const { thought_id } = params.arguments as { thought_id: number };
        return thinkingServer.retrieveRelevantThoughts({ thought_id });
      }
      
      case "branch_thought": {        
        if (!params.arguments) {
          console.error("ERROR: params.arguments object is undefined in branch_thought request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: params.arguments object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
        const { parent_thought_id, branch_id } = params.arguments as { parent_thought_id: number; branch_id: string };
        return thinkingServer.branchThought({ parent_thought_id, branch_id });
      }
      
      case "composed_think": {        
        if (!params.arguments) {
          console.error("ERROR: params.arguments object is undefined in composed_think request");
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Invalid request: params.arguments object is undefined",
                status: "failed"
              })
            }],
            isError: true
          };
        }
        
        // Type assertion for the params.arguments
        const toolParams = params.arguments as z.infer<typeof captureThoughtSchema>;
        
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