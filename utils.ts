
import { QuestionData, BloomLevel, SimilarityPair } from "./types";

/**
 * Parses the specific format: Question (Marks) Answer Level
 */
export const parseInputText = (text: string): QuestionData[] => {
  const bloomLevels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
  const questions: QuestionData[] = [];
  
  // Split by double newline or significant line breaks to separate question blocks
  const blocks = text.split(/\n\n+/).filter(b => b.trim().length > 10);

  blocks.forEach((block, index) => {
    try {
      const cleanBlock = block.trim().replace(/\n/g, ' ');
      
      // 1. Find Marks: (2 marks)
      const marksRegex = /\((\d+)\s*marks?\)/i;
      const marksMatch = cleanBlock.match(marksRegex);
      if (!marksMatch) return;

      const marks = parseInt(marksMatch[1], 10);
      const marksIndex = cleanBlock.indexOf(marksMatch[0]);

      // 2. Find Level (Searching for Bloom words at the end of the text)
      let foundLevel: BloomLevel | null = null;
      let levelIndex = -1;

      for (const level of bloomLevels) {
        const regex = new RegExp(`\\b${level}\\b$`, 'i'); // Check at the end
        if (regex.test(cleanBlock)) {
          foundLevel = level;
          levelIndex = cleanBlock.lastIndexOf(level);
          break;
        }
      }

      // Fallback: search anywhere if not strictly at end
      if (!foundLevel) {
        for (const level of bloomLevels) {
          const idx = cleanBlock.toLowerCase().lastIndexOf(level.toLowerCase());
          if (idx > levelIndex) {
            levelIndex = idx;
            foundLevel = level;
          }
        }
      }

      if (!foundLevel) return;

      // 3. Extract parts
      const question = cleanBlock.substring(0, marksIndex).trim();
      const answer = cleanBlock.substring(marksIndex + marksMatch[0].length, levelIndex).trim();

      if (question && answer) {
        questions.push({
          id: `q-${index}-${Date.now()}`,
          question,
          answer,
          marks,
          level: foundLevel
        });
      }
    } catch (e) {
      console.warn("Error parsing block:", block);
    }
  });

  return questions;
};

/**
 * Fetches and parses CSV data from a public link (like Google Sheets)
 */
export const fetchQuestionsFromSheet = async (url: string): Promise<QuestionData[]> => {
  // Try to force CSV output if it's a Google Sheet link
  let csvUrl = url;
  if (url.includes('docs.google.com/spreadsheets') && !url.includes('output=csv')) {
    csvUrl = url.replace(/\/edit.*$/, '/pub?output=csv');
  }

  const response = await fetch(csvUrl);
  if (!response.ok) throw new Error("Failed to fetch sheet data. Is the sheet published to web as CSV?");
  
  const text = await response.text();
  const rows = text.split('\n').filter(row => row.trim().length > 0);
  
  // If the CSV is just one column of the user's specific text format
  if (rows[0].split(',').length === 1) {
    return parseInputText(text);
  }

  // Otherwise, try to parse as standard CSV rows
  return rows.slice(1).map((row, i) => {
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex to handle commas in quotes
    return {
      id: `sheet-${i}-${Date.now()}`,
      question: cols[0]?.replace(/^"|"$/g, '') || "Untitled",
      answer: cols[1]?.replace(/^"|"$/g, '') || "No answer",
      marks: parseInt(cols[2]) || 2,
      level: (cols[3]?.trim() as BloomLevel) || "Remember"
    };
  });
};

export const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return (normA === 0 || normB === 0) ? 0 : dotProduct / (normA * normB);
};

export const findSimilarPairs = (questions: QuestionData[], embeddings: number[][], threshold: number): SimilarityPair[] => {
  const pairs: SimilarityPair[] = [];
  if (embeddings.length < 2) return [];
  
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const score = calculateCosineSimilarity(embeddings[i], embeddings[j]);
      if (score >= threshold) {
        pairs.push({
          q1Id: questions[i].id,
          q2Id: questions[j].id,
          q1Text: questions[i].question,
          q2Text: questions[j].question,
          score: score
        });
      }
    }
  }
  return pairs;
};
