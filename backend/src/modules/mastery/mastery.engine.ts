export interface EvidenceToken {
  studentId: string;
  teacherSubjectId: string;
  curriculumTopicId: string;
  evidenceScore: number; // 0.0 to 1.0 (e.g. 1.0 for correct, 0.0 for incorrect, partial marks allowed)
  source: 'quiz' | 'ai_tutor';
  sourceQuizId?: string;
}

export interface CurrentMasteryState {
  masteryScore: number;
  confidence: number;
}

export interface UpdatedMasteryState {
  masteryScore: number;
  confidence: number;
  delta: number;
}

/**
 * Deterministic Mastery Engine
 * Implements Bayesian-inspired mastery progression without probabilistic LLM hallucination.
 * "Agents reason over evidence; deterministic services maintain canonical learning state."
 */
export class DeterministicMasteryEngine {
  /**
   * Calculates new deterministic mastery score and confidence based on incoming evidence
   */
  static computeNewState(
    current: CurrentMasteryState,
    evidence: EvidenceToken
  ): UpdatedMasteryState {
    const { masteryScore: mOld, confidence: cOld } = current;
    const e = Math.min(1.0, Math.max(0.0, evidence.evidenceScore));

    // Base learning rate by assessment channel
    // Quizzes carry higher evidentiary weight than informal conversational tutor hints
    const alpha = evidence.source === 'quiz' ? 0.35 : 0.20;

    // Delta formula: high existing confidence dampens drastic volatility
    const confidenceDampener = 1.0 - 0.4 * cOld;
    const delta = alpha * (e - mOld) * confidenceDampener;

    // Strict boundary enforcement: [0.0000, 1.0000]
    const mNew = Math.min(1.0, Math.max(0.0, mOld + delta));

    // Confidence monotonically increases with each evidence point, asymptotically approaching 1.0
    const confidenceGain = evidence.source === 'quiz' ? 0.15 : 0.08;
    const cNew = Math.min(1.0, cOld + confidenceGain * (1.0 - cOld));

    return {
      masteryScore: Number(mNew.toFixed(4)),
      confidence: Number(cNew.toFixed(4)),
      delta: Number(delta.toFixed(4)),
    };
  }
}
