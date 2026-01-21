
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-6 px-4 mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ExamQ Instructor</h1>
            <p className="text-slate-500 text-sm">Automated Assessment Verification & Bloom's Taxonomy Review</p>
          </div>
        </div>
       
      </div>
    </header>
  );
};

export default Header;
