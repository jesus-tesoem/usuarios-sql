import React from 'react';
import { X, BookOpen, Database, Terminal } from 'lucide-react';

interface DCLCheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DCLCheatsheetModal: React.FC<DCLCheatsheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Guía Canónica DCL (Data Control Language)</h3>
              <p className="text-xs text-slate-400">Comparativa directa: MySQL 8.0+ vs Microsoft SQL Server (T-SQL)</p>
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
        <div className="overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
          {/* Comparison table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MySQL column */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-cyan-800/40">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-900/40 text-cyan-400 font-semibold text-sm">
                <span>🐬 MySQL (8.0+)</span>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">1. Crear Usuario:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`CREATE USER 'usuario'@'localhost'
  IDENTIFIED BY 'Contraseña$2026';`}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">2. Otorgar Permisos con Ámbito:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`-- Nivel base de datos:
GRANT SELECT, INSERT ON tienda_db.*
  TO 'usuario'@'localhost';

-- Nivel tabla específica:
GRANT SELECT, UPDATE ON tienda_db.clientes
  TO 'usuario'@'localhost';`}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">3. Revocar Permisos y Refrescar:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`REVOKE DELETE ON tienda_db.*
  FROM 'usuario'@'localhost';

FLUSH PRIVILEGES;`}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">4. Gestión de Roles:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`CREATE ROLE 'rol_ventas';
GRANT SELECT ON tienda_db.articulos TO 'rol_ventas';
GRANT 'rol_ventas' TO 'usuario'@'localhost';
SET DEFAULT ROLE 'rol_ventas' TO 'usuario'@'localhost';`}
                  </pre>
                </div>
              </div>
            </div>

            {/* SQL Server column */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-amber-800/40">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-900/40 text-amber-400 font-semibold text-sm">
                <span>🏛️ Microsoft SQL Server (T-SQL)</span>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">1. Crear Login en Servidor (Instancia):</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`CREATE LOGIN app_login
  WITH PASSWORD = 'App$StrongPassword2026!',
  CHECK_POLICY = ON;
GO`}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">2. Cambiar Contexto y Crear User:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`USE tienda_db;
GO

CREATE USER app_user FOR LOGIN app_login;
GO`}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">3. Otorgar y Denegar (DENY vs REVOKE):</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`GRANT SELECT, INSERT ON dbo.clientes TO app_user;
GO

-- DENY anula cualquier permiso heredado por rol:
DENY SELECT ON dbo.Salarios TO app_user;
GO`}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">4. Asignación a Roles de Base de Datos:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`ALTER ROLE db_datareader ADD MEMBER app_user;
GO`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Golden Rules Callout */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Terminal className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-slate-200 mb-1">Reglas de Oro en Taller de Bases de Datos</h5>
              <p className="text-slate-400 text-xs">
                1. <strong>Nunca uses contraseñas en blanco o 12345</strong>: ambos motores aplican o recomiendan filtros de complejidad de contraseñas.<br/>
                2. <strong>En MySQL, &apos;usuario&apos; != &apos;usuario&apos;@&apos;localhost&apos;</strong>: la tabla <code>mysql.user</code> usa una clave primaria compuesta <code>(Host, User)</code>.<br/>
                3. <strong>En SQL Server, LOGIN != USER</strong>: un Login autentica conexiones entrantes a nivel de puerto/instancia; un User es el principal que tiene permisos sobre las tablas del catálogo.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
