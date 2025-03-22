import { DateTime } from "luxon";

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

// Data structures
export interface CognitiveContext {
  workingMemory: Record<string, any>;
  longTermMemory: Record<string, any>;
  attentionFocus: string | null;
  confidenceLevel: number;
  reasoningChain: string[];
  timestamp: DateTime;
  contextTags: string[];
}

export interface ThoughtData {
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

export interface EnhancedThoughtData extends ThoughtData {
  context: CognitiveContext;
  dependencies: number[];
  confidenceScore: number;
  reasoningType: string;
  metacognitionNotes: string[];
  priority: number;
  complexity: number;
}