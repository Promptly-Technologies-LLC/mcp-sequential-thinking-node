import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as path from 'node:path';
import * as os from 'node:os';

interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

describe('Sequential Thinking Server Integration', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    console.log('Setting up Sequential Thinking server test...');

    // Set up the transport
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      env: {
        NODE_ENV: "test",
        DEBUG: "mcp:*"  // Enable MCP debug logging
      }
    });

    console.log('Created transport with command: node dist/index.js');

    // Set up the client
    client = new Client(
      {
        name: "sequential-thinking-test-client",
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

    try {
      console.log('Attempting to connect to server...');
      // Connect to the server with a timeout
      let timeoutId: NodeJS.Timeout;
      
      const connectPromise = client.connect(transport);
      const timeoutPromise = new Promise<void>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      await Promise.race([connectPromise, timeoutPromise])
        .finally(() => {
          clearTimeout(timeoutId);
        });
      
      console.log('Successfully connected to server');

      // Small delay to ensure server is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to connect to server:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      console.log('Cleaning up...');
      // Ensure transport is properly closed
      if (transport) {
        console.log('Closing transport...');
        transport.close();
        
        // Allow time for the subprocess to terminate
        await new Promise<void>(resolve => {
          setTimeout(resolve, 100);
        });
        
        console.log('Transport closed successfully');
      }
    } catch (err) {
      console.error('Error closing transport:', err);
    }
  });

  it('should list available tools', async () => {
    console.log('Testing tool listing...');
    const response = await client.listTools();
    expect(response).toBeDefined();
    expect(response).toHaveProperty('tools');
    expect(Array.isArray(response.tools)).toBe(true);
    expect(response.tools.length).toBeGreaterThan(0);
    
    // Check for our specific tools
    const toolNames = response.tools.map(tool => tool.name);
    console.log('Available tools:', toolNames);
    expect(toolNames).toContain('sequential_thinking');
    expect(toolNames).toContain('get_thinking_summary');
    expect(toolNames).toContain('clear_thinking_history');
  });

  it('should process a thought and generate a summary', async () => {
    console.log('Testing sequential thinking workflow...');
    
    // Clear any existing history first
    const clearResult = await client.callTool({
      name: "clear_thinking_history",
      parameters: {}
    }) as ToolResponse;
    
    expect(clearResult.isError).toBeFalsy();
    const clearData = JSON.parse(clearResult.content[0].text);
    expect(clearData.status).toBe("success");
    console.log('History cleared successfully');
    
    // Submit a thought
    const thoughtResult = await client.callTool({
      name: "sequential_thinking",
      parameters: {
        thought: "This is a test thought for integration testing",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        stage: "Problem Definition",
        score: 0.8,
        tags: ["test", "integration"]
      }
    }) as ToolResponse;
    
    expect(thoughtResult.isError).toBeFalsy();
    const thoughtData = JSON.parse(thoughtResult.content[0].text);
    expect(thoughtData).toHaveProperty('thoughtAnalysis');
    expect(thoughtData.thoughtAnalysis.currentThought.thoughtNumber).toBe(1);
    expect(thoughtData.thoughtAnalysis.currentThought.stage).toBe("Problem Definition");
    console.log('Thought processed successfully');
    
    // Get summary
    const summaryResult = await client.callTool({
      name: "get_thinking_summary",
      parameters: {}
    }) as ToolResponse;
    
    expect(summaryResult.isError).toBeFalsy();
    const summaryData = JSON.parse(summaryResult.content[0].text);
    expect(summaryData).toHaveProperty('summary');
    expect(summaryData.summary.totalThoughts).toBe(1);
    expect(summaryData.summary.stages).toHaveProperty('Problem Definition');
    console.log('Summary generated successfully');
  });

  it('should handle thought sequencing and branching', async () => {
    // Clear history before test
    await client.callTool({
      name: "clear_thinking_history",
      parameters: {}
    });
    
    // Add first thought
    const thought1Result = await client.callTool({
      name: "sequential_thinking",
      parameters: {
        thought: "Initial thought",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        stage: "Problem Definition",
        score: 0.7
      }
    }) as ToolResponse;
    
    expect(thought1Result.isError).toBeFalsy();
    
    // Add second thought in sequence
    const thought2Result = await client.callTool({
      name: "sequential_thinking",
      parameters: {
        thought: "Follow-up thought",
        thought_number: 2,
        total_thoughts: 3,
        next_thought_needed: true,
        stage: "Analysis",
        score: 0.8
      }
    }) as ToolResponse;
    
    expect(thought2Result.isError).toBeFalsy();
    
    // Add a branch thought
    const branchResult = await client.callTool({
      name: "sequential_thinking",
      parameters: {
        thought: "Alternative approach",
        thought_number: 1,
        total_thoughts: 2,
        next_thought_needed: true,
        stage: "Ideation",
        branch_from_thought: 1,
        branch_id: "alt-branch",
        score: 0.9
      }
    }) as ToolResponse;
    
    expect(branchResult.isError).toBeFalsy();
    const branchData = JSON.parse(branchResult.content[0].text);
    expect(branchData.thoughtAnalysis.context.activeBranches).toContain("alt-branch");
    
    // Get summary and check branches
    const summaryResult = await client.callTool({
      name: "get_thinking_summary",
      parameters: {}
    }) as ToolResponse;
    
    const summaryData = JSON.parse(summaryResult.content[0].text);
    expect(summaryData.summary.totalThoughts).toBe(3);
    expect(summaryData.summary.branches).toHaveProperty("alt-branch");
    console.log('Branching handled successfully');
  });
});
