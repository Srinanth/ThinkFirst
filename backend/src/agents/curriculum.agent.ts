import { generateJSON } from './gemini.client.js';

export interface CurriculumNodeParsed {
  title: string;
  description?: string;
  nodeType: 'module' | 'topic' | 'subtopic';
  children?: CurriculumNodeParsed[];
}

export interface SyllabusParseResult {
  courseTitle?: string;
  modules: CurriculumNodeParsed[];
}

const SYSTEM_INSTRUCTION = `
You are the ThinkFirst Curriculum Intelligence Agent.
Your job is to parse raw course syllabus text, lecture outlines, or textbook table of contents into a structured hierarchical curriculum tree.
Follow these rules strictly:
1. Divide the course into top-level modules (nodeType = "module").
2. Inside each module, break down topics (nodeType = "topic").
3. For deep or nuanced topics, create subtopics (nodeType = "subtopic").
4. Provide concise, clear descriptions explaining the core concepts covered in each node.
5. Return ONLY a valid JSON object matching the requested schema.
`;

/**
 * Parses raw syllabus text into structured hierarchical curriculum nodes
 */
export async function parseSyllabusWithAgent(syllabusText: string): Promise<SyllabusParseResult> {
  const prompt = `
Please analyze the following syllabus text and produce a structured curriculum tree:

--- SYLLABUS TEXT ---
${syllabusText}
---------------------

Expected JSON format:
{
  "courseTitle": "Course Name",
  "modules": [
    {
      "title": "Module 1: ...",
      "description": "Overview of module...",
      "nodeType": "module",
      "children": [
        {
          "title": "Topic Name",
          "description": "Key concepts...",
          "nodeType": "topic",
          "children": [
            {
              "title": "Subtopic Name",
              "description": "Specific focus...",
              "nodeType": "subtopic"
            }
          ]
        }
      ]
    }
  ]
}
`;

  return generateJSON<SyllabusParseResult>({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    fallbackDefault: {
      modules: [],
    },
  });
}
