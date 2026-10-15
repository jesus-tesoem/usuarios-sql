import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Rúbrica de Evaluación DCL - Taller de Bases de Datos</h3>
              <p className="text-xs text-slate-400">Criterios rigurosos de calificación para MySQL y SQL Server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Criterio 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300">Criterio 1</span>
              <h4 className="font-semibold text-white">Sintaxis Rigurosa y Delimitación</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              El evaluador examina comas faltantes, delimitadores de fin de sentencia (punto y coma o GO), comillas simples obligatorias en contraseñas y palabras reservadas del estándar SQL y dialectos específicos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200">
                <span className="font-semibold block text-rose-300">❌ Error común:</span>
                <code>IDENTIFIED BY 12345;</code> (sin comillas) o comillas sin cerrar.
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-200">
                <span className="font-semibold block text-emerald-300">✅ Correcto:</span>
                <code>IDENTIFIED BY &apos;Clave$2026_Fuerte&apos;;</code>
              </div>
            </div>
          </div>

          {/* Criterio 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300">Criterio 2</span>
              <h4 className="font-semibold text-white">Dominio Conceptual de Motores (MySQL vs SQL Server)</h4>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="font-semibold text-cyan-400 block mb-1">🐬 En MySQL:</span>
                Identidad compuesta por <code>&apos;usuario&apos;@&apos;host&apos;</code>. No omitir el host para evitar conexiones huérfanas o no autorizadas. Exigir <code>FLUSH PRIVILEGES</code> para refrescar tablas de concesión.
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="font-semibold text-amber-400 block mb-1">🏛️ En SQL Server:</span>
                Distinción estricta entre <strong>LOGIN</strong> (autenticación en la instancia a nivel de servidor) y <strong>USER</strong> (autorización en el catálogo de base de datos con <code>FOR LOGIN</code>). Uso del separador de lotes <code>GO</code> al cambiar de contexto con <code>USE</code>.
              </div>
            </div>
          </div>

          {/* Criterio 3 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300">Criterio 3</span>
              <h4 className="font-semibold text-white">Principio de Menor Privilegio (PoLP) y Seguridad</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-2">
              Un administrador de bases de datos profesional nunca debe asignar <code>GRANT ALL ON *.*</code> ni roles fijos como <code>sysadmin</code> a menos que la tarea lo justifique expresamente.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
              <li>Delimitar el ámbito a la base de datos de la práctica (<code>bd_practica.*</code>).</li>
              <li>Asignar únicamente las operaciones requeridas (ej: <code>SELECT, INSERT</code> en lugar de <code>ALL</code>).</li>
              <li>Exigir contraseñas no triviales que cumplan políticas de complejidad.</li>
            </ul>
          </div>

          {/* Criterio 4 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300">Criterio 4</span>
              <h4 className="font-semibold text-white">Pedagogía Socrática</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              El tutor <strong>nunca</strong> proporciona la solución final escrita directamente. En su lugar, entrega una <em>Pista Pedagógica</em> con preguntas reflexivas para que el alumno analice el concepto teórico subyacente y reconstruya el código por sí mismo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
