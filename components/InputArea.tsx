
import React, { useState } from 'react';
import { fetchQuestionsFromSheet } from '../utils';

interface InputAreaProps {
  onProcess: (questionsText: string, contextText: string, isFromSheet?: boolean, sheetUrl?: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onProcess, isLoading }) => {
  const [questionsText, setQuestionsText] = useState('');
  const [contextText, setContextText] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [mode, setMode] = useState<'manual' | 'sheet'>('manual');

  const handleLoadExample = () => {
    setQuestionsText(`What is data according to the database ? (2 marks) Data is any sort of information that is stored. Examples include messages and multimedia on WhatsApp, products and orders on Amazon, and contact details in a telephone directory. Remember
List any two advantages of using a Database Management System (DBMS). (2 marks) Two advantages of DBMS are: 1) Security - Data is stored and maintained securely, and 2) Ease of Use - Provides simpler ways to create and update data at the rate it is generated and updated. Remember`);
    setContextText(`A database is an organized collection of data. A DBMS is software that stores and manages data securely. Advantages include data security, concurrent access, and automated backups.`);
  };

  return (
    <div className="space-y-6 mb-12">
      {/* Step 1: Reference Knowledge */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fas fa-book-open text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Domain Cheatsheet</h2>
              <p className="text-xs text-slate-500">The AI will use this as the absolute source of truth.</p>
            </div>
          </div>
          <button onClick={handleLoadExample} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">
            Load Demo Data
          </button>
        </div>
        <textarea
          className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm leading-relaxed"
          placeholder="Paste your course content or cheatsheet text here..."
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
        />
      </div>

      {/* Step 2: Question Input */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 transition-all hover:shadow-md">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'manual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <i className="fas fa-keyboard"></i> Manual Input
          </button>
          <button 
            onClick={() => setMode('sheet')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'sheet' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <i className="fas fa-file-excel"></i> Sheet Link
          </button>
        </div>

        {mode === 'manual' ? (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Question Batch</p>
            <textarea
              className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-mono text-sm leading-relaxed"
              placeholder="Question (Marks) Answer BloomLevel..."
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Google Sheet CSV Link</p>
            <input
              type="text"
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="https://docs.google.com/spreadsheets/.../pub?output=csv"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
              <i className="fas fa-info-circle text-amber-500 mt-1"></i>
              <p className="text-xs text-amber-800 leading-relaxed">
                Ensure your sheet is <strong>Published to the Web</strong> as a <strong>CSV</strong>. 
                Go to File &rarr; Share &rarr; Publish to web &rarr; Select CSV.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => onProcess(questionsText, contextText, mode === 'sheet', sheetUrl)}
          disabled={isLoading || (mode === 'manual' && !questionsText.trim()) || (mode === 'sheet' && !sheetUrl.trim())}
          className="w-full mt-8 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Instructor Reviewing...
            </>
          ) : (
            <>
              <i className="fas fa-shield-halved group-hover:rotate-12 transition-transform"></i>
              Verify Assessment Integrity
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
