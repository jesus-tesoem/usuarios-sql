import React, { useState } from 'react';
import { EvaluationResponse, SQLEngine } from '../types/dcl';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ShieldAlert,
  Search,
  Terminal,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface EvaluationResultProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
  engine: SQLEngine;
  source?: 'gemini' | 'local-tutor';
  onRetryWithHint?: () => void;
}

export const EvaluationResult: React.FC<EvaluationResultProps> = ({
  evaluation,
  isLoading,
  engine,
  source,
  onRetryWithHint,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl h-full min-h-[380px] text-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-3 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Sparkles className="w-5 h-5 text-blue-400 absolute inset-0 m-auto" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-200">
            Tutor Riguroso Evaluando Sentencias DCL...
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Analizando sintaxis, ámbito de conexión en {engine === 'mysql' ? 'MySQL' : 'SQL Server'}, jerarquía de privilegios y políticas de seguridad.
          </p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl h-full min-h-[380px] text-center space-y-3">
        <div className="p-3 rounded-full bg-slate-800 text-slate-400">
          <Terminal className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-300">
            Esperando Código DCL para Evaluación
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Escribe tus instrucciones SQL o selecciona una práctica para que el tutor analice la sintaxis, arquitectura de identidades y seguridad.
          </p>
        </div>
      </div>
    );
  }

  const { status, syntaxAndLogic, pedagogicalHint, securityObservation, consoleSimulation, rawMarkdown } = evaluation;

  const isCorrect = status === 'Correcto';
  const isCorrectionRequired = status === 'Requiere Corrección';
  const isCritical = status === 'Error Crítico';

  const statusColor = isCorrect
    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
    : isCorrectionRequired
    ? 'text-amber-400 bg-amber-950/40 border-amber-800/50'
    : 'text-rose-400 bg-rose-950/40 border-rose-800/50';

  const StatusIcon = isCorrect ? CheckCircle2 : isCorrectionRequired ? AlertTriangle : XCircle;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
      {/* Result Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${statusColor}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Dictamen del Tutor
              </span>
              {source === 'gemini' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Gemini 3.8 Flash
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                  Validador DCL
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>📊 Estado:</span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                  isCorrect
                    ? 'bg-emerald-500 text-slate-950'
                    : isCorrectionRequired
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          title="Copiar respuesta exacta del evaluador"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado al portapapeles' : 'Copiar Dictamen'}</span>
        </button>
      </div>

      {/* Result Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Section 1: Análisis de Sintaxis y Lógica */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Search className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              🔍 Análisis de Sintaxis y Lógica
            </h4>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 pl-6 leading-relaxed">
            {syntaxAndLogic.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold font-mono">{idx + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Pista Pedagógica */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              💡 Pista Pedagógica
            </h4>
          </div>

          <div className="text-xs text-amber-100/90 pl-6 leading-relaxed font-sans">
            {pedagogicalHint}
          </div>
        </div>

        {/* Section 3: Observación de Seguridad */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              🛡️ Observación de Seguridad
            </h4>
          </div>

          <div className="text-xs text-rose-100/90 pl-6 leading-relaxed">
            {securityObservation}
          </div>
        </div>

        {/* Section 4: Simulación en Consola (Only if Correct) */}
        {isCorrect && consoleSimulation && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Terminal className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  💻 Simulación de Consola en Tiempo Real
                </h4>
              </div>
              <span className="text-[10px] text-emerald-500/80 font-mono">
                {engine === 'mysql' ? 'MySQL 8.0 Engine' : 'Microsoft SQL Server 2022'}
              </span>
            </div>

            <pre className="p-3 rounded-lg bg-black/80 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-emerald-950">
              {consoleSimulation}
            </pre>
          </div>
        )}

        {/* Interactive Reflection Quiz when correction is needed */}
        {!isCorrect && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <HelpCircle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Pregunta de Reflexión para el Estudiante
              </h4>
            </div>

            <p className="text-xs text-indigo-100">
              {engine === 'mysql'
                ? '¿Cuál es el beneficio de especificar \'usuario\'@\'localhost\' en lugar de un comodín global o no especificar host?'
                : '¿Por qué en SQL Server se debe crear primero un LOGIN en master y luego un USER en la base de datos específica?'}
            </p>

            <div className="space-y-1.5 text-xs">
              {engine === 'mysql' ? (
                <>
                  {[
                    'Limita el acceso exclusivamente a conexiones desde la máquina local, reduciendo la superficie de ataque de red.',
                    'Permite que el usuario se conecte desde cualquier dirección IP de Internet sin restricción.',
                    'Acelera la velocidad de las consultas SELECT en un 50%.'
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedQuizOption(i);
                        setQuizSubmitted(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition ${
                        selectedQuizOption === i
                          ? i === 0
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-rose-950/60 border-rose-500 text-rose-200'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold mr-1.5">{String.fromCharCode(65 + i)})</span>
                      {opt}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    'Separa la capa de autenticación a nivel de servidor (credenciales) de la capa de autorización por base de datos (permisos a tablas).',
                    'Es un requisito opcional que solo se usa si la base de datos está en la nube.',
                    'El comando USER no existe en SQL Server; solo se usan LOGINS.'
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedQuizOption(i);
                        setQuizSubmitted(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition ${
                        selectedQuizOption === i
                          ? i === 0
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-rose-950/60 border-rose-500 text-rose-200'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold mr-1.5">{String.fromCharCode(65 + i)})</span>
                      {opt}
                    </button>
                  ))}
                </>
              )}
            </div>

            {quizSubmitted && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  selectedQuizOption === 0
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                }`}
              >
                {selectedQuizOption === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>¡Excelente deducción! Ahora aplica este concepto en tu código SQL.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Pista: La opción correcta es la A. Repasa la arquitectura de seguridad antes de continuar.</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
