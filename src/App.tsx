import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CodeEditor } from './components/CodeEditor';
import { EvaluationResult } from './components/EvaluationResult';
import { PrivilegeVisualizer } from './components/PrivilegeVisualizer';
import { LabExercisesSelector } from './components/LabExercisesSelector';
import { RubricModal } from './components/RubricModal';
import { DCLCheatsheetModal } from './components/DCLCheatsheetModal';
import { LAB_EXERCISES, PRESET_CODE_SNIPPETS } from './data/exercises';
import { SQLEngine, EvaluationResponse, EvaluationRecord, LabExercise } from './types/dcl';
import { BookOpen, Sparkles, AlertTriangle, ShieldCheck, History, ArrowRight } from 'lucide-react';

export default function App() {
  const [engine, setEngine] = useState<SQLEngine>('mysql');
  // Initialize with the exact prompt reference example
  const [code, setCode] = useState<string>(PRESET_CODE_SNIPPETS[0].code);
  const [selectedExercise, setSelectedExercise] = useState<LabExercise | null>(LAB_EXERCISES[0]);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [evaluationSource, setEvaluationSource] = useState<'gemini' | 'local-tutor'>('gemini');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<EvaluationRecord[]>([]);

  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);

  // Auto-run first evaluation on mount to immediately show tutor output for the reference case
  useEffect(() => {
    handleEvaluate(PRESET_CODE_SNIPPETS[0].code, 'mysql', LAB_EXERCISES[0].goal);
  }, []);

  const handleEvaluate = async (codeToEval?: string, engineToEval?: SQLEngine, context?: string) => {
    const targetCode = codeToEval ?? code;
    const targetEngine = engineToEval ?? engine;
    const targetContext = context ?? selectedExercise?.goal ?? '';

    if (!targetCode.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/evaluate-dcl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: targetCode,
          engine: targetEngine,
          taskContext: targetContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setEvaluationSource(data.source);

        const newRecord: EvaluationRecord = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          engine: targetEngine,
          code: targetCode,
          response: data.evaluation,
          source: data.source,
        };
        setHistory(prev => [newRecord, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error('Error al evaluar DCL:', err);
      // Fallback state if server request failed completely
      setEvaluation({
        status: 'Error Crítico',
        syntaxAndLogic: ['No fue posible contactar el servicio de evaluación. Verifique la conexión al servidor.'],
        pedagogicalHint: 'Revisa la sintaxis general de sentencias DCL mientras se restablece la comunicación.',
        securityObservation: 'Aplica siempre el principio de menor privilegio.',
        rawMarkdown: `📊 **Estado:** Error Crítico\n\n🔍 **Análisis de Sintaxis y Lógica:**\n1. Error de conexión con el evaluador.\n\n💡 **Pista Pedagógica:**\nRevisa las sentencias DCL en el manual de ${targetEngine}.\n\n🛡️ **Observación de Seguridad:**\nVerifica las políticas de acceso.`
      });
      setEvaluationSource('local-tutor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExercise = (exercise: LabExercise) => {
    setSelectedExercise(exercise);
    setEngine(exercise.engine);
    setCode(exercise.initialCode);
    setEvaluation(null);
  };

  const handleSelectPreset = (preset: { label: string; engine: SQLEngine; code: string }) => {
    setEngine(preset.engine);
    setCode(preset.code);
    setSelectedExercise(null);
    setEvaluation(null);
  };

  const handleReset = () => {
    setCode('');
    setEvaluation(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Navbar */}
      <Navbar
        engine={engine}
        setEngine={(newEngine) => {
          setEngine(newEngine);
          setEvaluation(null);
        }}
        onOpenRubric={() => setIsRubricOpen(true)}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        evaluationCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner with Active Exercise Context */}
        {selectedExercise ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Práctica Activa: {selectedExercise.difficulty}
                </span>
                <span className="text-xs font-semibold text-slate-200">{selectedExercise.title}</span>
              </div>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                {selectedExercise.goal}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCode(selectedExercise.initialCode)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/40 transition"
              >
                Recargar Código Inicial
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">Modo Libre: Evaluación personalizada para {engine === 'mysql' ? 'MySQL 8.0' : 'SQL Server'}</span>
            </div>
            <span className="text-[11px] text-slate-400">Pega cualquier script DCL de creación de usuarios, roles o privilegios</span>
          </div>
        )}

        {/* Workspace: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Code Editor & Privilege Matrix (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex-1 min-h-[380px]">
              <CodeEditor
                code={code}
                onChange={setCode}
                engine={engine}
                onEvaluate={() => handleEvaluate()}
                isLoading={isLoading}
                onReset={handleReset}
              />
            </div>

            {/* Visual Privilege Inspector */}
            <PrivilegeVisualizer code={code} engine={engine} />
          </div>

          {/* Right Column: Tutor Evaluation Result (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <EvaluationResult
              evaluation={evaluation}
              isLoading={isLoading}
              engine={engine}
              source={evaluationSource}
              onRetryWithHint={() => {}}
            />
          </div>
        </div>

        {/* Lower Section: Lab Exercises & Reference Selector */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <LabExercisesSelector
            currentEngine={engine}
            selectedExerciseId={selectedExercise?.id || null}
            onSelectExercise={handleSelectExercise}
            onSelectPresetSnippet={handleSelectPreset}
          />
        </div>

        {/* History of Attempts */}
        {history.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Historial de Intentos de la Sesión ({history.length})</span>
              </div>
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition"
              >
                Limpiar historial
              </button>
            </div>

            <div className="space-y-1.5">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    setCode(rec.code);
                    setEngine(rec.engine);
                    setEvaluation(rec.response);
                    setEvaluationSource(rec.source);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-800/60 cursor-pointer transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.response.status === 'Correcto'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : rec.response.status === 'Requiere Corrección'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {rec.response.status}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] truncate max-w-xs sm:max-w-md">
                      {rec.code.replace(/\n/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="uppercase font-mono">{rec.engine}</span>
                    <span>{rec.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Taller de Bases de Datos &copy; 2026 - Control de Acceso (DCL) y Principio de Menor Privilegio</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsRubricOpen(true)} className="hover:text-slate-400 underline">
              Criterios de Evaluación
            </button>
            <span>&bull;</span>
            <button onClick={() => setIsCheatsheetOpen(true)} className="hover:text-slate-400 underline">
              Guía Canónica
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RubricModal isOpen={isRubricOpen} onClose={() => setIsRubricOpen(false)} />
      <DCLCheatsheetModal isOpen={isCheatsheetOpen} onClose={() => setIsCheatsheetOpen(false)} />
    </div>
  );
}
