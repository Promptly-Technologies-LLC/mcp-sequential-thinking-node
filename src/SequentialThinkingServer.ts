import { ThoughtStage } from "./types.js";
import { ThoughtData } from "./types.js";
import { thoughtStageFromString } from "./utils.js";
import { DateTime } from "luxon";

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

export class EnhancedSequentialThinkingServer extends SequentialThinkingServer {
  private memoryManager = new MemoryManager();
  private reasoningEngine = new ReasoningEngine();
  private metacognitiveMonitor = new MetacognitiveMonitor();
  
  // Find thought by ID (thought number)
  private findThoughtById(thoughtId: number): ThoughtData | undefined {
    return this.thoughtHistory.find(t => t.thoughtNumber === thoughtId);
  }
  
  // Update thought in history
  private updateThought(updatedThought: ThoughtData): void {
    const idx = this.thoughtHistory.findIndex(t => t.thoughtNumber === updatedThought.thoughtNumber);
    if (idx !== -1) {
      this.thoughtHistory[idx] = updatedThought;
    }
  }

  // 1. Capture a new thought
  captureThought(inputData: any): any {
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
      
      // Return in the format expected by tests
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
      return this.handleError(e);
    }
  }

  // Revise thought
  reviseThought(input: { 
    thought_id: number;
    thought?: string;
    thought_number?: number;
    total_thoughts?: number;
    next_thought_needed?: boolean;
    stage?: string;
    is_revision?: boolean;
    revises_thought?: number;
    branch_from_thought?: number;
    branch_id?: string;
    needs_more_thoughts?: boolean;
    score?: number;
    tags?: string[];
  }): any {
    try {
      // Find the thought to revise
      const thought = this.findThoughtById(input.thought_id);
      if (!thought) {
        throw new Error(`Thought with ID ${input.thought_id} not found`);
      }
      
      // Update thought properties with any provided values
      if (input.thought !== undefined) thought.thought = input.thought;
      if (input.next_thought_needed !== undefined) thought.nextThoughtNeeded = input.next_thought_needed;
      if (input.stage !== undefined) thought.stage = thoughtStageFromString(input.stage);
      if (input.is_revision !== undefined) thought.isRevision = input.is_revision;
      if (input.revises_thought !== undefined) thought.revisesThought = input.revises_thought;
      if (input.branch_from_thought !== undefined) thought.branchFromThought = input.branch_from_thought;
      if (input.branch_id !== undefined) thought.branchId = input.branch_id;
      if (input.needs_more_thoughts !== undefined) thought.needsMoreThoughts = input.needs_more_thoughts;
      if (input.score !== undefined) thought.score = input.score;
      if (input.tags !== undefined) thought.tags = input.tags;
      
      // Set revision flag
      thought.isRevision = true;
      
      // Update thought in history
      this.updateThought(thought);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            revision: {
              thoughtNumber: thought.thoughtNumber,
              stage: thought.stage,
              updated: true,
              timestamp: DateTime.now().toISO()
            }
          }, null, 2)
        }]
      };
      
    } catch (e) {
      return this.handleError(e);
    }
  }

  // 1. Apply reasoning to a thought
  applyReasoning(input: { thought_id: number; reasoning_type?: string }): any {
    try {
      // Find the thought
      const thought = this.findThoughtById(input.thought_id);
      if (!thought) {
        throw new Error(`Thought with ID ${input.thought_id} not found`);
      }
      
      // Apply reasoning strategy
      const pattern = input.reasoning_type || this.reasoningEngine.analyzeThoughtPattern(thought);
      const updatedThought = this.reasoningEngine.applyReasoningStrategy(thought);
      
      // Update thought in history
      this.updateThought(updatedThought);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            reasoningApplied: {
              thoughtNumber: updatedThought.thoughtNumber,
              pattern: pattern,
              tags: updatedThought.tags
            }
          }, null, 2)
        }]
      };
      
    } catch (e) {
      return this.handleError(e);
    }
  }
  
  // 2. Evaluate thought quality
  evaluateThoughtQuality(input: { thought_id: number }): any {
    try {
      // Find the thought
      const thought = this.findThoughtById(input.thought_id);
      if (!thought) {
        throw new Error(`Thought with ID ${input.thought_id} not found`);
      }
      
      // Get quality metrics and improvement suggestions
      const metrics = this.metacognitiveMonitor.evaluateThoughtQuality(thought);
      const improvements = this.metacognitiveMonitor.generateImprovementSuggestions(metrics);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            evaluation: {
              thoughtNumber: thought.thoughtNumber,
              qualityMetrics: metrics,
              suggestedImprovements: improvements
            }
          }, null, 2)
        }]
      };
      
    } catch (e) {
      return this.handleError(e);
    }
  }
  
  // 3. Retrieve relevant thoughts
  retrieveRelevantThoughts(input: { thought_id: number }): any {
    try {
      // Find the thought
      const thought = this.findThoughtById(input.thought_id);
      if (!thought) {
        throw new Error(`Thought with ID ${input.thought_id} not found`);
      }
      
      // Get related thoughts
      const relatedThoughts = this.memoryManager.retrieveRelevantThoughts(thought);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            retrieval: {
              thoughtNumber: thought.thoughtNumber,
              relatedThoughtsCount: relatedThoughts.length,
              relatedThoughts: relatedThoughts.map(t => ({
                thoughtNumber: t.thoughtNumber,
                stage: t.stage,
                tags: t.tags
              }))
            }
          }, null, 2)
        }]
      };
      
    } catch (e) {
      return this.handleError(e);
    }
  }
  
  // 4. Branch thought
  branchThought(input: { parent_thought_id: number; branch_id: string }): any {
    try {
      // Find the parent thought
      const parentThought = this.findThoughtById(input.parent_thought_id);
      if (!parentThought) {
        throw new Error(`Parent thought with ID ${input.parent_thought_id} not found`);
      }
      
      // Create branch if it doesn't exist
      if (!this.branches[input.branch_id]) {
        this.branches[input.branch_id] = [];
        this.activeBranchId = input.branch_id;
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            branching: {
              parentThoughtNumber: parentThought.thoughtNumber,
              branchId: input.branch_id,
              isActive: this.activeBranchId === input.branch_id
            }
          }, null, 2)
        }]
      };
      
    } catch (e) {
      return this.handleError(e);
    }
  }
  
  // Helper method for error handling
  private handleError(e: unknown): any {
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
  
  clearHistory(): void {
    this.thoughtHistory = [];
    this.branches = {};
    this.memoryManager.clear();
    this.activeBranchId = null;
  }
}