# Structured Thinking MCP Server

A TypeScript Model Context Protocol (MCP) server based on [Arben Ademi](https://github.com/arben-adm)'s [Sequential Thinking](https://github.com/arben-adm/mcp-sequential-thinking) Python server. The motivation for this project is to allow LLMs to programmatically construct mind maps to explore an idea space, with enforced "metacognitive" self-reflection.

## Setup

Set the tool configuration in Claude Desktop, Cursor, or another MCP client as follows:

```json
{
  "structured-thinking": {
    "command": "npx",
    "args": ["-y", "structured-thinking"]
  }
}
```

## Overview

### Thought Quality Scores

When an LLM captures a thought, it assigns that thought a quality score between 0 and 1. This score is used, in combination with the thought's stage, for providing "metacognitive" feedback to the LLM how to "steer" its thinking process.

### Thought Stages

Each thought is tagged with a stage (e.g., Problem Definition, Analysis, Ideation) to help manage the life-cycle of the LLM's thinking process. In the current implementation, these stages play a very important role. In effect, if the LLM spends too long in a given stage or is having low-quality thoughts in the current stage, the server will provide feedback to the LLM to "steer" its thinking toward other stages, or at least toward thinking strategies that are atypical of the current stage. (E.g., in deductive mode, the LLM will be encouraged to consider more creative thoughts.)

### Thought Branching

The LLM can spawn “branches” off a particular thought to explore different lines of reasoning in parallel. Each branch is tracked separately, letting you manage scenarios where multiple solutions or ideas should coexist.

### Memory Management

The server maintains a "short-term" memory buffer of the LLM's ten most recent thoughts, and a "long-term" memory of thoughts that can be retrieved based on their tags for summarization of the entire history of the LLM's thinking process on a given topic.

## Limitations

### Naive Metacognitive Monitoring

Currently, the quality metrics and metacognitive feedback are derived mechanically from naive stage-based multipliers applied to a single self-reported quality score.

As part of the future work, I plan to add more sophisticated metacognitive feedback, including semantic analysis of thought content, thought verification processes, and more intelligent monitoring for reasoning errors.

### Lack of User Interface

Currently, the server stores all thoughts in memory, and does not persist them to a file or database. There is also no user interface for reviewing the thought space or visualizing the mind map.

As part of the future work, I plan to incorporate a simple visualization client so the user can watch the thought graph evolve.

## MCP Tools

The server exposes the following MCP tools:

### capture_thought

Create a thought in the thought history, with metadata about the thought's type, quality, content, and relationships to other thoughts.

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

### revise_thought

Revise a thought in the thought history, with metadata about the thought's type, quality, content, and relationships to other thoughts.

Parameters:
- `thought_id`: The ID of the thought to revise
- Parameters from `capture_thought`

### retrieve_relevant_thoughts

Retrieve thoughts from long-term storage that share tags with the specified thought.

Parameters:
- `thought_id`: The ID of the thought to retrieve relevant thoughts for

### get_thinking_summary

Generate a comprehensive summary of the entire thinking process.

### clear_thinking_history

Clear all recorded thoughts and reset the server state.

## License

MIT
