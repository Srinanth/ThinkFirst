import { generateJSON } from '../../agents/gemini.client.js';

export interface GeneratedInsight {
  insightType: 'weak_areas' | 'strong_areas' | 'summary';
  title: string;
  description: string;
  curriculumTopicId?: string;
  studentId?: string;
  evidence?: Record<string, unknown>;
}

export interface InsightSynthesisInput {
  subjectName: string;
  classOverview: Array<{
    topicId: string;
    title: string;
    averageMastery: number;
    strugglingStudentsCount: number;
  }>;
  totalStudents: number;
}

const SYSTEM_INSTRUCTION = `
You are the ThinkFirst Class Mastery Summary Synthesizer.
Analyze aggregated class mastery metrics, identify systemic conceptual hurdles, and provide actionable pedagogical recommendations for educators.
Rules:
1. Identify high-priority weak areas (topics where average mastery < 0.50 or high struggle count).
2. Highlight strong areas where the class has demonstrated solid conceptual grasp.
3. Provide a concise executive summary with concrete teaching interventions.
4. Return ONLY a valid JSON object matching the requested schema.
`;

/**
 * Traditional LLM calling method to synthesize class-level mastery overview summaries
 */
export async function synthesizeClassInsights(
  input: InsightSynthesisInput
): Promise<GeneratedInsight[]> {
  const prompt = `
Analyze the following classroom mastery analytics for class "${input.subjectName}":
Total Students Enrolled: ${input.totalStudents}

Topic Mastery Breakdown:
${JSON.stringify(input.classOverview, null, 2)}

Synthesize diagnostic insights for the teacher. Return JSON in this format:
{
  "insights": [
    {
      "insightType": "weak_areas",
      "title": "Critical Gap: ...",
      "description": "Pedagogical explanation of why students struggle and what to teach...",
      "curriculumTopicId": "<topicId if applicable>",
      "evidence": {
        "averageMastery": 0.38,
        "affectedCount": 12
      }
    },
    {
      "insightType": "summary",
      "title": "Weekly Teaching Recommendation",
      "description": "Recommended focus for upcoming lectures...",
      "evidence": {
        "actionItem": "Review prerequisite concept..."
      }
    }
  ]
}
`;

  const result = await generateJSON<{ insights: GeneratedInsight[] }>({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    fallbackDefault: { insights: [] },
  });

  return result.insights || [];
}
