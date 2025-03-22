import { ThoughtStage } from "./types.js";

// Helper to convert string to ThoughtStage
export function thoughtStageFromString(stage: string): ThoughtStage {
  switch (stage.toLowerCase()) {
    case "problem definition":
      return ThoughtStage.PROBLEM_DEFINITION;
    case "analysis":
      return ThoughtStage.ANALYSIS;
    case "ideation":
      return ThoughtStage.IDEATION;
    case "evaluation":
      return ThoughtStage.EVALUATION;
    case "implementation":
      return ThoughtStage.IMPLEMENTATION;
    case "refinement":
      return ThoughtStage.REFINEMENT;
    case "plan":
      return ThoughtStage.PLAN;
    case "research":
      return ThoughtStage.RESEARCH;
    case "synthesis":
      return ThoughtStage.SYNTHESIS;
    case "conclusion":
      return ThoughtStage.CONCLUSION;
    default:
      // Default to problem definition if stage is unknown
      return ThoughtStage.PROBLEM_DEFINITION;
  }
}