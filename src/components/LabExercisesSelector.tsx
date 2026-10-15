import React from 'react';
import { LAB_EXERCISES, PRESET_CODE_SNIPPETS } from '../data/exercises';
import { LabExercise, SQLEngine } from '../types/dcl';
import { BookOpen, CheckCircle, Code, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

interface LabExercisesSelectorProps {
  currentEngine: SQLEngine;
  selectedExerciseId: string | null;
  onSelectExercise: (exercise: LabExercise) => void;
  onSelectPresetSnippet: (snippet: { label: string; engine: SQLEngine; code: string }) => void;
}

export const LabExercisesSelector: React.FC<LabExercisesSelectorProps> = ({
  currentEngine,
  selectedExerciseId,
  onSelectExercise,
  onSelectPresetSnippet,
}) => {
  return (
    <div className="space-y-4">
      {/* Quick Case presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Casos de Prueba Rápidos del Taller
          </span>
          <span className="text-[11px] text-slate-400">
            Click para cargar código
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRESET_CODE_SNIPPETS.map((preset, idx) => {
            const isMatch = preset.engine === currentEngine;
            return (
              <button
                key={idx}
                onClick={() => onSelectPresetSnippet(preset)}
                className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between gap-1.5 ${
                  isMatch
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                    : 'bg-slate-950/40 hover:bg-slate-900 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold line-clamp-1">{preset.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                      preset.engine === 'mysql'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                    }`}
                  >
                    {preset.engine}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 truncate w-full">
                  {preset.code.split('\n')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guided Lab Exercises */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Prácticas de Laboratorio con Rúbrica
          </span>
          <span className="text-[11px] text-slate-400">
            Retos estructurados para alumnos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {LAB_EXERCISES.map((ex) => {
            const isSelected = selectedExerciseId === ex.id;
            const isEngineMatch = ex.engine === currentEngine;

            return (
              <div
                key={ex.id}
                onClick={() => onSelectExercise(ex)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                      {ex.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          ex.engine === 'mysql'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                        }`}
                      >
                        {ex.engine === 'mysql' ? 'MySQL' : 'SQL Server'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {ex.goal}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span>{ex.requirements.length} requerimientos</span>
                  <span className="flex items-center gap-1 text-indigo-400 font-medium">
                    Cargar en Editor <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
