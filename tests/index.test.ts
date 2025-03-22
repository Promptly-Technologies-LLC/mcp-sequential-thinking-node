/**
 * Example Jest tests for the refactored Structured Thinking MCP Server.
 */

import { createServer } from "../index";  // Adjust the path
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

describe("Structured Thinking MCP Server", () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(() => {
    // Instantiate the server once for all tests
    server = createServer();
  });

  afterAll(() => {
    // If you need to do any cleanup
  });

  // Helper function to simulate calling a tool via the server
  async function callTool(toolName: string, parameters: any) {
    // Access the internal request handlers to directly process the tool call
    const request: CallToolRequest = {
      params: {
        name: toolName,
        parameters: parameters
      },
      method: "tools/call"
    };

    // Get the handler function that was set up for CallToolRequestSchema
    const handler = (server as any)._requestHandlers.get("tools/call");
    
    if (!handler) {
      throw new Error("No handler found for tool calls");
    }

    return handler(request);
  }

  test("capture_thought - basic success", async () => {
    const result = await callTool("capture_thought", {
      thought: "Testing the capture tool.",
      thought_number: 1,
      total_thoughts: 3,
      next_thought_needed: true,
      stage: "Problem Definition", // Must match a valid ThoughtStage
      // optional fields:
      score: 0.8,
      tags: ["test", "capture"]
    });

    // The shape of 'result' depends on how your code returns content in server.setRequestHandler
    expect(result).toHaveProperty("content");
    expect(result.content?.[0]).toHaveProperty("type", "text");

    // Optionally parse and verify deeper fields
    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("success");
    expect(parsed.thoughtCaptured).toBeDefined();
    expect(parsed.thoughtCaptured.thoughtNumber).toBe(1);
  });

  test("apply_reasoning - basic success", async () => {
    // We'll assume the thought with ID=1 already exists from the previous test
    const result = await callTool("apply_reasoning", {
      thought_id: 1
      // optional: reasoning_type: "deductive"
    });

    expect(result).toHaveProperty("content");
    
    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("success");
    expect(parsed.reasoningApplied).toBeDefined();
    expect(parsed.reasoningApplied.thoughtNumber).toBe(1);
  });

  test("evaluate_thought_quality - thought not found", async () => {
    const result = await callTool("evaluate_thought_quality", {
      thought_id: 9999  // Intentionally does not exist
    });

    // We expect an error response
    expect(result).toHaveProperty("isError", true);
    expect(result).toHaveProperty("content");
    
    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("failed");
    expect(parsed.error).toMatch(/not found/i);
  });

  test("evaluate_thought_quality - success", async () => {
    // Evaluate quality on the thought we captured earlier
    const result = await callTool("evaluate_thought_quality", {
      thought_id: 1
    });

    expect(result).toHaveProperty("content");

    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("success");
    expect(parsed.evaluation).toBeDefined();
    expect(parsed.evaluation.qualityMetrics).toHaveProperty("coherence");
  });

  test("retrieve_relevant_thoughts - success", async () => {
    // Let's retrieve relevant thoughts for thought_id = 1
    const result = await callTool("retrieve_relevant_thoughts", {
      thought_id: 1
    });

    expect(result).toHaveProperty("content");

    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("success");
    expect(parsed.retrieval).toBeDefined();
    expect(parsed.retrieval.relatedThoughts).toBeInstanceOf(Array);
  });

  test("branch_thought - success", async () => {
    // We'll branch from the captured thought #1
    const result = await callTool("branch_thought", {
      parent_thought_id: 1,
      branch_id: "branch-abc"
    });

    expect(result).toHaveProperty("content");

    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("success");
    expect(parsed.branching).toHaveProperty("branchId", "branch-abc");
  });

  test("composed_think - success", async () => {
    // This calls the entire pipeline in one shot
    const result = await callTool("composed_think", {
      thought: "All-in-one pipeline test.",
      thought_number: 2,
      total_thoughts: 3,
      next_thought_needed: false,
      stage: "Analysis",
      tags: ["pipeline", "test"],
      score: 0.7
    });

    expect(result).toHaveProperty("content");
    
    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed).toHaveProperty("thoughtAnalysis");
    expect(parsed.thoughtAnalysis.currentThought.thoughtNumber).toBe(2);
  });

  test("get_thinking_summary - success", async () => {
    const result = await callTool("get_thinking_summary", {});

    expect(result).toHaveProperty("content");
    
    const summary = JSON.parse(result.content?.[0].text || "{}");
    expect(summary).toHaveProperty("summary");
    expect(summary.summary).toHaveProperty("totalThoughts");
    expect(summary.summary.totalThoughts).toBeGreaterThan(0);
  });

  test("clear_thinking_history - success", async () => {
    const result = await callTool("clear_thinking_history", {});

    expect(result).toHaveProperty("content");

    const parsed = JSON.parse(result.content?.[0].text || "{}");
    expect(parsed.status).toBe("success");
    expect(parsed.message).toBe("Thinking history cleared");
  });
});
