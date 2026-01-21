import OpenAI from "openai";
import { QuestionData, ReviewResult, BloomLevel } from "./types";

/**
 * World-Class Academic Instructor System
 * Using OpenAI GPT-4 for expert-level domain verification.
 */

// Get API key from environment
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Debug: Log if API key is present (first few characters only for security)
if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
  console.error('❌ OpenAI API Key is missing or not set!');
  console.error('Please update your .env.local file with a valid OpenAI API key');
  console.error('Get your API key from: https://platform.openai.com/api-keys');
} else {
  console.log('✅ OpenAI API Key loaded:', apiKey.substring(0, 7) + '...');
}

const openai = new OpenAI({ 
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

const reviewSchema = {
  type: "object",
  properties: {
    isTaxonomyCorrect: { type: "boolean" },
    isAnswerSufficient: { type: "boolean" },
    isWithinContext: { type: "boolean" },
    remark: { type: "string" },
    contextRemark: { type: "string" },
    suggestedQuestion: { type: "string" },
    suggestedAnswer: { type: "string" },
    suggestedLevel: { type: "string" },
    suggestedMarks: { type: "number" },
    status: { type: "string" }
  },
  required: [
    "isTaxonomyCorrect", "isAnswerSufficient", "isWithinContext",
    "remark", "contextRemark", "suggestedQuestion", 
    "suggestedAnswer", "suggestedLevel", "suggestedMarks", "status"
  ],
  additionalProperties: false
};

export const reviewQuestion = async (q: QuestionData, context: string): Promise<ReviewResult> => {
  try {
    console.log(`📝 Reviewing question: ${q.id}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Change to "gpt-4o" for better quality but higher cost
      messages: [
        {
          role: "system",
          content: "You are a Senior Academic Auditor & Domain Expert Instructor. Provide responses in valid JSON format only."
        },
        {
          role: "user",
          content: `
ROLE: Senior Academic Auditor & Domain Expert Instructor.

DOMAIN CONTEXT (SOURCE MATERIAL):
${context || "Strictly no context provided. Evaluate purely on general academic standards but mark 'isWithinContext' as FALSE."}

ITEM UNDER REVIEW:
- Question: ${q.question}
- Marks Assigned: ${q.marks}
- Intended Taxonomy Level: ${q.level}
- Sample Answer: ${q.answer}

CRITICAL AUDIT TASKS:
1. CONTEXT CHECK: Is this question and answer supported BY NAME in the Domain Context?
2. TAXONOMY CHECK: Does the cognitive load of the question match "${q.level}"? (e.g., Explain = Understand, List = Remember).
3. MARKING CHECK: Is the Answer deep enough for ${q.marks} marks? (1 mark usually equals 1 point/fact).
4. CORRECTION: If any flaw is found, rewrite the question/answer to be pedagogically perfect.

IMPORTANT: The "status" field must be EXACTLY one of these values (lowercase): "valid", "warning", or "error"

Respond with JSON matching this schema:
${JSON.stringify(reviewSchema, null, 2)}
          `
        }
      ],
      response_format: { 
        type: "json_schema",
        json_schema: {
          name: "review_result",
          strict: true,
          schema: reviewSchema
        }
      },
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and normalize status
    const validStatuses = ['valid', 'warning', 'error'];
    if (!validStatuses.includes(result.status?.toLowerCase())) {
      console.warn(`⚠️ Invalid status "${result.status}" returned, defaulting to "warning"`);
      result.status = 'warning';
    } else {
      result.status = result.status.toLowerCase();
    }
    
    console.log(`✅ Review complete for ${q.id}: ${result.status}`);
    
    return { ...result, questionId: q.id };
  } catch (error) {
    console.error("OpenAI Auditor Error:", error);
    
    // Return a default error review instead of throwing
    return {
      questionId: q.id,
      isTaxonomyCorrect: false,
      isAnswerSufficient: false,
      isWithinContext: false,
      remark: "Failed to review this question due to an API error. Please try again.",
      contextRemark: "Unable to verify context alignment.",
      suggestedQuestion: q.question,
      suggestedAnswer: q.answer,
      suggestedLevel: q.level,
      suggestedMarks: q.marks,
      status: 'error'
    };
  }
};

export const getBatchEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (texts.length === 0) return [];
  try {
    // OpenAI allows batch embedding in a single call
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // or "text-embedding-3-large" for higher dimensions
      input: texts,
      encoding_format: "float"
    });
    
    // Extract embeddings in order
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error("Embedding Error:", error);
    return [];
  }
};