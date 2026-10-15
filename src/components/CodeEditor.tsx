import React, { useRef } from 'react';
import { SQLEngine } from '../types/dcl';
import { analyzePreflight } from '../utils/dclParser';
import { Play, RotateCcw, Copy, Check, Sparkles, AlertCircle, Info, Terminal } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  engine: SQLEngine;
  onEvaluate: () => void;
  isLoading: boolean;
  onReset: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  engine,
  onEvaluate,
  isLoading,
  onReset,
}) => {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const preflightIssues = analyzePreflight(code, engine);
  const lineCount = code.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = code.substring(0, start);
    const after = code.substring(end);
    const updated = before + snippet + after;
    onChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onEvaluate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-xs font-mono text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>script_dcl.sql</span>
          </div>
          <span className="text-[11px] text-slate-400">
            ({lineCount} {lineCount === 1 ? 'línea' : 'líneas'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Copiar código SQL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
            title="Limpiar editor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Quick Snippets Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[10px] text-slate-500 font-medium shrink-0 uppercase tracking-wider">
          Insertar rápido:
        </span>
        {engine === 'mysql' ? (
          <>
            <button
              onClick={() => insertSnippet("'usuario'@'localhost'")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-cyan-300 hover:bg-cyan-950/60 hover:text-cyan-200 transition shrink-0"
            >
              &apos;user&apos;@&apos;localhost&apos;
            </button>
            <button
              onClick={() => insertSnippet("IDENTIFIED BY 'Clave$2026';")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 transition shrink-0"
            >
              IDENTIFIED BY &apos;...&apos;
            </button>
            <button
              onClick={() => insertSnippet("FLUSH PRIVILEGES;")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-emerald-300 hover:bg-emerald-950/60 hover:text-emerald-200 transition shrink-0"
            >
              FLUSH PRIVILEGES;
            </button>
            <button
              onClick={() => insertSnippet("CREATE ROLE 'rol_auditor';")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-purple-300 hover:bg-purple-950/60 hover:text-purple-200 transition shrink-0"
            >
              CREATE ROLE
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => insertSnippet("CREATE LOGIN [app_login] WITH PASSWORD = 'StrongPass$2026!';\nGO\n")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-amber-300 hover:bg-amber-950/60 hover:text-amber-200 transition shrink-0"
            >
              CREATE LOGIN ... GO
            </button>
            <button
              onClick={() => insertSnippet("USE [taller_db];\nGO\n")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-cyan-300 hover:bg-cyan-950/60 hover:text-cyan-200 transition shrink-0"
            >
              USE [db]; GO
            </button>
            <button
              onClick={() => insertSnippet("CREATE USER [app_user] FOR LOGIN [app_login];\nGO\n")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-emerald-300 hover:bg-emerald-950/60 hover:text-emerald-200 transition shrink-0"
            >
              CREATE USER ... FOR LOGIN
            </button>
            <button
              onClick={() => insertSnippet("ALTER ROLE db_datareader ADD MEMBER [app_user];\nGO\n")}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-purple-300 hover:bg-purple-950/60 hover:text-purple-200 transition shrink-0"
            >
              ALTER ROLE ADD MEMBER
            </button>
          </>
        )}
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex min-h-[280px]">
        {/* Line Numbers */}
        <div className="w-10 select-none py-3 text-right pr-3 font-mono text-xs text-slate-600 bg-slate-950/40 border-r border-slate-800/60 space-y-1">
          {Array.from({ length: Math.max(lineCount, 8) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`-- Escribe tus sentencias DCL (${engine === 'mysql' ? 'MySQL' : 'SQL Server'}) aquí...\n-- Ejemplo: CREATE USER ... / GRANT ... / REVOKE ...`}
            className="w-full h-full p-3 font-mono text-sm leading-relaxed text-slate-100 bg-transparent resize-none focus:outline-hidden selection:bg-blue-600/40"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Preflight Diagnostics bar */}
      {preflightIssues.length > 0 && (
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-xs space-y-1 max-h-24 overflow-y-auto">
          {preflightIssues.map((diag, i) => (
            <div
              key={i}
              className={`flex items-start gap-1.5 ${
                diag.type === 'error' ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{diag.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer & Submit Button */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
            Ctrl + Enter
          </kbd>
          <span>para evaluar</span>
        </div>

        <button
          onClick={onEvaluate}
          disabled={isLoading || !code.trim()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs tracking-wide transition shadow-lg ${
            isLoading || !code.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analizando con Tutor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Evaluar Código DCL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
