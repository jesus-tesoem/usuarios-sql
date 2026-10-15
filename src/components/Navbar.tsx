import React from 'react';
import { SQLEngine } from '../types/dcl';
import { ShieldCheck, BookOpen, Database, History, HelpCircle } from 'lucide-react';

interface NavbarProps {
  engine: SQLEngine;
  setEngine: (engine: SQLEngine) => void;
  onOpenRubric: () => void;
  onOpenCheatsheet: () => void;
  evaluationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  engine,
  setEngine,
  onOpenRubric,
  onOpenCheatsheet,
  evaluationCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Dr. Jesus Vazquez Castillo
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Taller de Bases de Datos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluador automático y tutor riguroso de código DCL (MySQL & SQL Server)
            </p>
          </div>
        </div>

        {/* Engine Switcher & Tools */}
        <div className="flex items-center gap-3">
          {/* Engine Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setEngine('mysql')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                engine === 'mysql'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🐬</span>
              <span>MySQL 8.0</span>
            </button>
            <button
              onClick={() => setEngine('sqlserver')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                engine === 'sqlserver'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏛️</span>
              <span>SQL Server (T-SQL)</span>
            </button>
          </div>

          {/* Quick Guidance buttons */}
          <button
            onClick={onOpenRubric}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Rúbrica</span>
          </button>

          <button
            onClick={onOpenCheatsheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Guía DCL</span>
          </button>

          {evaluationCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <History className="w-3 h-3 text-indigo-400" />
              <span>{evaluationCount} {evaluationCount === 1 ? 'intento' : 'intentos'}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
