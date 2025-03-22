import { ThoughtStage } from "./types";

// Helper to convert string to ThoughtStage
function thoughtStageFromString(value: string): ThoughtStage {
  // Try direct conversion first
  if (Object.values(ThoughtStage).includes(value as ThoughtStage)) {
    return value as ThoughtStage;
  }

  // Try case-insensitive match with enum names
  const upperValue = value.toUpperCase();
  for (const stageName of Object.keys(ThoughtStage)) {
    if (stageName.toUpperCase() === upperValue) {
      return ThoughtStage[stageName as keyof typeof ThoughtStage];
    }
  }

  // Try matching the value part
  for (const stageValue of Object.values(ThoughtStage)) {
    if (stageValue.toUpperCase() === upperValue) {
      return stageValue as ThoughtStage;
    }
  }

  // If no match found, throw error
  throw new Error(`Invalid stage: ${value}. Valid stages are: ${Object.values(ThoughtStage).join(", ")}`);
}

export { thoughtStageFromString };