import React, { useState, useCallback, useMemo } from 'react';
import { AppState, QuestionData, ReviewResult, SimilarityPair } from './types';
import { parseInputText, findSimilarPairs, fetchQuestionsFromSheet } from './utils';
import { reviewQuestion, getBatchEmbeddings } from './openaiService';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ReviewCard from './components/ReviewCard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    questions: [],
    context: '',
    reviews: {},
    similarPairs: [],
    similarityThreshold: 0.82,
    isProcessing: false,
    error: null,
  });

  const [embeddings, setEmbeddings] = useState<number[][]>([]);
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleProcess = useCallback(async (questionsText: string, contextText: string, isFromSheet = false, sheetUrl = '') => {
    setState(prev => ({ ...prev, isProcessing: true, error: null, reviews: {}, similarPairs: [], questions: [] }));
    setProcessingStep('Initializing instructor audit...');

    try {
      let parsedQuestions: QuestionData[] = [];
      
      if (isFromSheet) {
        setProcessingStep('Fetching data from Google Sheet...');
        parsedQuestions = await fetchQuestionsFromSheet(sheetUrl);
      } else {
        parsedQuestions = parseInputText(questionsText);
      }
      
      if (parsedQuestions.length === 0) {
        throw new Error("No valid questions detected. Ensure format is: Question (Marks) Answer Level");
      }

      setState(prev => ({ ...prev, questions: parsedQuestions, context: contextText }));

      // Step 1: Semantic Analysis (Redundancy check)
      setProcessingStep('Analyzing semantic overlap...');
      const textForEmbeddings = parsedQuestions.map(q => q.question);
      const questionEmbeds = await getBatchEmbeddings(textForEmbeddings);
      setEmbeddings(questionEmbeds);
      
      const pairs = findSimilarPairs(parsedQuestions, questionEmbeds, state.similarityThreshold);
      setState(prev => ({ ...prev, similarPairs: pairs }));

      // Step 2: Individual Instructor Reviews
      setProcessingStep('Conducting pedagogical audit...');
      for (let i = 0; i < parsedQuestions.length; i++) {
        const q = parsedQuestions[i];
        setProcessingStep(`Reviewing item ${i + 1} of ${parsedQuestions.length}...`);
        try {
          const review = await reviewQuestion(q, contextText);
          setState(prev => ({
            ...prev,
            reviews: { ...prev.reviews, [q.id]: review }
          }));
        } catch (err) {
          console.error(`Failed item audit:`, err);
        }
      }
    } catch (err: any) {
      console.error("Audit failure:", err);
      setState(prev => ({ 
        ...prev, 
        error: err.message || 'Critical failure in the AI Instructor engine.' 
      }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
      setProcessingStep('');
    }
  }, [state.similarityThreshold]);

  const filteredSimilarPairs = useMemo(() => {
    if (embeddings.length === 0) return [];
    return findSimilarPairs(state.questions, embeddings, state.similarityThreshold);
  }, [state.questions, embeddings, state.similarityThreshold]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <Header />
      <main className="max-w-5xl mx-auto px-6">
        <InputArea onProcess={handleProcess} isLoading={state.isProcessing} />

        {state.error && (
          <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-800 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <i className="fas fa-triangle-exclamation text-xl"></i>
            </div>
            <div className="pt-1">
              <p className="font-black text-sm uppercase tracking-wider mb-1">Process Halted</p>
              <p className="text-sm opacity-90 leading-relaxed">{state.error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-700"
              >
                Reset System
              </button>
            </div>
          </div>
        )}

        {state.questions.length > 0 && (
          <div className="mt-16 space-y-12">
            {/* Redundancy Analysis Tool */}
            <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <i className="fas fa-magnifying-glass-chart text-indigo-500"></i>
                    Similarity Analysis
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Auto-detecting semantic duplication</p>
                </div>
                <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Threshold</label>
                    <span className="text-sm font-black text-indigo-600">{(state.similarityThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="1" step="0.01" 
                    value={state.similarityThreshold}
                    onChange={(e) => setState(p => ({...p, similarityThreshold: parseFloat(e.target.value)}))}
                    className="accent-indigo-600 w-32"
                  />
                </div>
              </div>
              
              {filteredSimilarPairs.length > 0 ? (
                <div className="space-y-4">
                  {filteredSimilarPairs.map((pair, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-6 p-5 bg-amber-50/50 border border-amber-100 rounded-2xl text-sm animate-in zoom-in-95 duration-300">
                      <div className="bg-amber-500 text-white font-black px-4 py-2 rounded-xl text-[10px] whitespace-nowrap shadow-lg shadow-amber-200">
                        {Math.round(pair.score * 100)}% MATCH
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="p-3 bg-white rounded-xl border border-amber-200/40 text-xs italic font-medium">"{pair.q1Text}"</div>
                        <div className="p-3 bg-white rounded-xl border border-amber-200/40 text-xs italic font-medium">"{pair.q2Text}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm italic">
                  {state.isProcessing ? "Processing semantic vectors..." : "All items appear sufficiently unique."}
                </div>
              )}
            </div>

            {/* Verification Results */}
            <div className="space-y-8 pb-20">
              <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Instructor Audit Report
                </h3>
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  {state.questions.length} Items Audited
                </span>
              </div>
              {state.questions.map((q) => (
                <ReviewCard key={q.id} question={q} review={state.reviews[q.id]} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Persistence Floating Status */}
      {state.isProcessing && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl rounded-3xl px-8 py-6 border border-slate-700 flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-12 duration-500">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl animate-pulse">
            <i className="fas fa-brain"></i>
          </div>
          <div className="min-w-[240px]">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">Auditor Engine Active</span>
            <span className="text-lg font-bold text-white block truncate">{processingStep}</span>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
               <div className="bg-indigo-500 h-full animate-progress-indeterminate rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;