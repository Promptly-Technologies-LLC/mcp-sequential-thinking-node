# Sequential Thinking MCP Server

A TypeScript implementation of the [Sequential Thinking](https://github.com/arben-adm/mcp-sequential-thinking) Python server by [Arben Ademi](https://github.com/arben-adm) using the Model Context Protocol (MCP).

The motivation for the translation was to allow easier global installation and usage of the tool. (The Python ecosystem discourages global installation.)

## Setup

Set the tool configuration in Claude Desktop, Cursor, or another MCP client as follows:

```json
{
  "tools": {
    "@promptly/mcp-sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@promptly/mcp-sequential-thinking"]
    }
  }
}
```

## Overview

This server provides tools for structured, reflective thinking through a series of thought stages. It implements:

- Sequential thinking with stage management
- Memory consolidation for thought patterns
- Reasoning strategy application
- Metacognitive monitoring and analysis

## Features

- **Thought Stages**: Process thinking through structured stages (Problem Definition, Analysis, Ideation, etc.)
- **Memory Management**: Store important thoughts for later reference
- **Reasoning Patterns**: Apply different reasoning strategies (deductive, inductive, creative, etc.)
- **Metacognitive Insights**: Analyze thought quality and provide improvement suggestions
- **Branching Support**: Create and manage thought branches for exploring alternatives

## MCP Tools

The server exposes the following MCP tools:

### sequential_thinking

Process a structured thought with reflective analysis.

Parameters:
- `thought`: The content of the current thought
- `thought_number`: Current position in the sequence
- `total_thoughts`: Expected total number of thoughts
- `next_thought_needed`: Whether another thought should follow
- `stage`: Current thinking stage (e.g., "Problem Definition", "Analysis")
- `is_revision` (optional): Whether this revises a previous thought
- `revises_thought` (optional): Number of thought being revised
- `branch_from_thought` (optional): Starting point for a new thought branch
- `branch_id` (optional): Identifier for the current branch
- `needs_more_thoughts` (optional): Whether additional thoughts are needed
- `score` (optional): Quality score (0.0 to 1.0)
- `tags` (optional): Categories or labels for the thought

### get_thinking_summary

Generate a comprehensive summary of the entire thinking process.

### clear_thinking_history

Clear all recorded thoughts and reset the server state.

## License

MIT
