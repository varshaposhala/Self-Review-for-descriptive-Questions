import React from 'react';
import { QuestionData, ReviewResult } from '../types';

interface ReviewCardProps {
  question: QuestionData;
  review?: ReviewResult;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ question, review }) => {
  if (!review) return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse flex items-center justify-between">
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
        <div className="h-3 bg-slate-50 rounded w-1/2"></div>
      </div>
      <div className="w-10 h-10 bg-indigo-50 rounded-full"></div>
    </div>
  );

  const statusMap: Record<string, { color: string; icon: string; label: string }> = {
    valid: { color: 'emerald', icon: 'fa-check-double', label: 'Pedagogically Sound' },
    warning: { color: 'amber', icon: 'fa-exclamation-circle', label: 'Requires Polish' },
    error: { color: 'rose', icon: 'fa-times-circle', label: 'Action Required' },
  };

  // Normalize status to lowercase and provide fallback
  const normalizedStatus = (review.status || 'warning').toLowerCase();
  const statusConfig = statusMap[normalizedStatus] || statusMap.warning;
  const { color, icon, label } = statusConfig;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      {/* Status Banner */}
      <div className={`bg-${color}-500 px-6 py-2 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <i className={`fas ${icon}`}></i>
          {label}
        </div>
        <div className="flex gap-4">
           <span className="text-[10px] font-bold opacity-80 uppercase">ID: {question.id.split('-')[1]}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Original Content */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Original Question</label>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-slate-900 font-semibold leading-relaxed">{question.question}</p>
                <div className="mt-4 flex gap-3">
                   <span className="bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500">{question.marks} MARKS</span>
                   <span className="bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">{question.level}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Submitted Answer</label>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl italic text-slate-600 text-sm">
                "{question.answer}"
              </div>
            </div>
          </div>

          {/* Right Side: AI Audit */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Instructor Remark</label>
              <div className={`p-5 rounded-xl border ${review.status === 'valid' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {review.remark}
                </p>
                {!review.isWithinContext && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3">
                    <i className="fas fa-link-slash text-rose-500 mt-0.5"></i>
                    <p className="text-xs text-rose-800 font-bold">{review.contextRemark}</p>
                  </div>
                )}
              </div>
            </div>

            {review.status !== 'valid' && (
              <div className="pt-6 border-t border-slate-100 animate-in fade-in duration-700">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-3">Suggested Improvement</label>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-800">{review.suggestedQuestion}</p>
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase block mb-1">Model Answer</span>
                    <p className="text-xs text-emerald-800 italic">"{review.suggestedAnswer}"</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Opt. Taxonomy</span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded block text-center">{review.suggestedLevel}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Opt. Marks</span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded block text-center">{review.suggestedMarks}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;