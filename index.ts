#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { EnhancedSequentialThinkingServer } from "./src/SequentialThinkingServer.js";
import { toolDefinitions, captureThoughtSchema, reviseThoughtSchema } from "./src/tools.js";

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
      
      case "revise_thought": {        
        if (!params.arguments) {
          console.error("ERROR: params.arguments object is undefined in revise_thought request");
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
        
        // Cast the arguments to match reviseThoughtSchema
        const reviseParams = params.arguments as z.infer<typeof reviseThoughtSchema>;
        
        return thinkingServer.reviseThought(reviseParams);
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