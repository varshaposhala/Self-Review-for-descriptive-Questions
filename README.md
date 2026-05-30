# 🧠 AI Instructor Audit — Self-Review for Descriptive Questions

A React + TypeScript web application that acts as an **AI-powered academic auditor**. It uses OpenAI's **GPT-4o-mini** for pedagogical review and **text-embedding-3-small** for semantic similarity detection — automatically auditing descriptive exam questions for taxonomy alignment, answer sufficiency, context grounding, and redundancy.

> Built with Google AI Studio and deployable as a standalone web app.

---

## 🌟 What This Does

When educators create descriptive question banks, three common problems arise:

1. **Wrong Bloom's level** — a "list" question labelled as Analyze
2. **Insufficient answers** — a 5-mark question with a one-line answer
3. **Redundant questions** — semantically similar questions asking the same thing differently

This tool solves all three automatically using LLMs and text embeddings, providing a structured audit report with suggested fixes for each item.

---

## 🚀 Features

### 🔍 Semantic Redundancy Detection
- Generates vector embeddings for all questions using `text-embedding-3-small`
- Computes **cosine similarity** between every question pair
- Flags pairs exceeding a configurable similarity threshold (default: **82%**)
- Interactive threshold slider — adjustable in real-time without re-running the audit
- Displays matching question pairs side-by-side with their similarity score

### 📋 Per-Question Pedagogical Audit (GPT-4o-mini)
Each question is audited against three independent criteria:

| Check | Description |
|---|---|
| **Taxonomy Check** | Does the cognitive demand match the stated Bloom's level? |
| **Answer Sufficiency** | Is the model answer deep enough for the assigned marks? |
| **Context Grounding** | Is the question and answer supported by the provided domain context? |

Each question receives a status of `valid`, `warning`, or `error`, along with:
- A detailed remark explaining any issues found
- A context alignment remark
- A suggested improved question, answer, Bloom's level, and marks

### 📥 Flexible Input
- **Paste text** — free-text input with structured parsing (`Question (Marks) Answer Level` format)
- **Google Sheet URL** — fetch questions directly from a published spreadsheet

### ⚡ Real-time Processing
- Live step-by-step progress indicators during the audit pipeline
- Per-question streaming — cards appear as each review completes rather than all at once
- Floating status bar showing the current processing step

---

## 🗂️ Project Structure

```
Self-Review-for-descriptive-Questions/
├── components/
│   ├── Header.tsx          # App header
│   ├── InputArea.tsx       # Text input / Google Sheet URL input
│   └── ReviewCard.tsx      # Per-question audit result card
├── App.tsx                 # Root component — orchestrates pipeline
├── openaiService.ts        # GPT-4o-mini review + batch embedding calls
├── utils.ts                # Text parser, cosine similarity, sheet fetcher
├── types.ts                # Shared TypeScript types and interfaces
├── index.tsx               # React entry point
├── index.html              # HTML shell
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18+ | UI component framework |
| TypeScript | Type-safe development |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| OpenAI `gpt-4o-mini` | Per-question pedagogical audit via structured JSON output |
| OpenAI `text-embedding-3-small` | Batch vector embeddings for similarity detection |
| Cosine Similarity | Redundancy scoring between question pairs |

---

## 📋 Prerequisites

- Node.js 18+
- An **OpenAI API key** with access to `gpt-4o-mini` and `text-embedding-3-small`

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/varshaposhala/Self-Review-for-descriptive-Questions.git
   cd Self-Review-for-descriptive-Questions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set your API key**

   Create a `.env.local` file in the root:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🖥️ How to Use

### Step 1 — Input Questions
Either paste questions in the text area or provide a Google Sheet URL. The expected text format per question is:
```
Question text (Marks) Answer text Level
```

For example:
```
What is recursion? (2) Recursion is a function calling itself. Remember
Explain the concept of recursion with an example. (5) Recursion is... Understand
```

### Step 2 — Add Domain Context (Optional but Recommended)
Paste the relevant syllabus or course material. This is used to verify that each question is grounded in the source material (`isWithinContext` check).

### Step 3 — Run the Audit
Click **Run Audit**. The pipeline executes in two stages:
1. **Semantic Analysis** — all question texts are batch-embedded and similarity pairs are computed
2. **Pedagogical Audit** — each question is reviewed individually by GPT-4o-mini

### Step 4 — Review Results
- The **Similarity Analysis** panel shows flagged question pairs with their match percentage
- Adjust the threshold slider to widen or narrow the redundancy filter — results update live
- The **Instructor Audit Report** shows a card per question with its status, remarks, and suggested improvements

---

## 🔧 Technical Deep Dive

### Audit Pipeline
```
Input Questions
      ↓
  Parse & Validate
      ↓
  Batch Embed (text-embedding-3-small)  ←── Single API call for all questions
      ↓
  Cosine Similarity (all pairs)         ←── Pure computation, no API call
      ↓
  GPT-4o-mini Review (per question)     ←── N API calls (one per question)
      ↓
  Audit Report
```

### Structured JSON Output
The GPT review uses OpenAI's **structured output / JSON schema** mode (`response_format: json_schema`) to guarantee the response always matches the `ReviewResult` interface — eliminating the need for brittle response parsing.

### Cosine Similarity
Redundancy is detected by computing the cosine similarity between every pair of embedding vectors. This catches semantic duplicates even when the wording is different (e.g., "What is a linked list?" vs "Define the linked list data structure.").

### Threshold Slider
The similarity threshold is stored in React state and the `filteredSimilarPairs` list is derived via `useMemo`, so adjusting the slider instantly refilters the displayed pairs without any API calls.

---

## 📐 Type Definitions

```typescript
export interface QuestionData {
  id: string;
  question: string;
  answer: string;
  marks: number;
  level: BloomLevel; // 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'
}

export interface ReviewResult {
  questionId: string;
  isTaxonomyCorrect: boolean;
  isAnswerSufficient: boolean;
  isWithinContext: boolean;
  remark: string;
  contextRemark: string;
  suggestedQuestion: string;
  suggestedAnswer: string;
  suggestedLevel: BloomLevel;
  suggestedMarks: number;
  status: 'valid' | 'warning' | 'error';
}

export interface SimilarityPair {
  q1Id: string;
  q2Id: string;
  q1Text: string;
  q2Text: string;
  score: number;
}
```

---

## 📃 License

This project is open source. See the repository for details.
