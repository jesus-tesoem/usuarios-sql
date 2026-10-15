import React from 'react';
import { extractPrivilegeMappings } from '../utils/dclParser';
import { SQLEngine } from '../types/dcl';
import { Shield, ShieldAlert, Key, Globe, Database, Table, ArrowRight } from 'lucide-react';

interface PrivilegeVisualizerProps {
  code: string;
  engine: SQLEngine;
}

export const PrivilegeVisualizer: React.FC<PrivilegeVisualizerProps> = ({ code, engine }) => {
  const mappings = extractPrivilegeMappings(code, engine);
  const isGlobalScope = /\*\.\*|CONTROL\s+SERVER|SYSADMIN/i.test(code);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-semibold text-slate-200">
            Inspector de Alcance y Matriz de Privilegios
          </h4>
        </div>
        {isGlobalScope ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" />
            Ámbito Global (*.*) Detectado
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-3 h-3" />
            Ámbito Delimitado
          </span>
        )}
      </div>

      {mappings.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No se detectaron sentencias GRANT, REVOKE o DENY activas en el código.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {mappings.map((m, idx) => {
            const isDeny = m.action === 'DENY';
            const isRevoke = m.action === 'REVOKE';
            const isGrant = m.action === 'GRANT';

            const badgeBg = isDeny
              ? 'bg-rose-950/40 border-rose-800/40 text-rose-300'
              : isRevoke
              ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300';

            const actionLabel = isDeny ? 'DENY (Denegación)' : isRevoke ? 'REVOKE (Revocación)' : 'GRANT (Concesión)';

            const isGlobalTarget = m.targetObject === '*.*' || m.targetObject.includes('SERVER');

            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeBg}`}>
                    {actionLabel}
                  </span>
                  <span className="font-mono font-medium text-slate-200">
                    {m.privilegeType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <div className="flex items-center gap-1 text-slate-300">
                    {isGlobalTarget ? (
                      <Globe className="w-3.5 h-3.5 text-rose-400" />
                    ) : m.targetObject.includes('.') ? (
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Table className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span className="font-mono text-[11px] text-slate-300">{m.targetObject}</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

                  <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
                    <Key className="w-3 h-3 text-cyan-400" />
                    {m.principalName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
