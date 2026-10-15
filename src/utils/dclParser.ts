import { SQLEngine } from '../types/dcl';

export interface PreflightDiagnostic {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

export interface PrivilegeMapping {
  principalName: string;
  hostOrScope?: string;
  targetObject: string;
  privilegeType: string;
  action: 'GRANT' | 'REVOKE' | 'DENY';
}

export function analyzePreflight(code: string, engine: SQLEngine): PreflightDiagnostic[] {
  const diagnostics: PreflightDiagnostic[] = [];
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('--')) return;

    const upper = cleanLine.toUpperCase();

    if (engine === 'mysql') {
      // Check CREATE USER missing host
      if (/CREATE\s+USER\s+[`'"]?[a-zA-Z0-9_-]+[`'"]?(?:\s+IDENTIFIED|\s*;|\s*$)/i.test(cleanLine) && !cleanLine.includes('@')) {
        diagnostics.push({
          type: 'warning',
          message: 'Línea ' + lineNum + ': Falta la especificación de host (@\'localhost\' o @\'%\'). MySQL creará un usuario con comodín o generará ambigüedad.',
          line: lineNum
        });
      }

      // Check unquoted numeric password
      if (/IDENTIFIED\s+BY\s+\d+/i.test(cleanLine) || (/IDENTIFIED\s+BY\s+[a-zA-Z0-9]+/i.test(cleanLine) && !cleanLine.includes(`IDENTIFIED BY '`) && !cleanLine.includes(`IDENTIFIED BY "`))) {
        diagnostics.push({
          type: 'error',
          message: 'Línea ' + lineNum + ': Sintaxis de contraseña sin comillas simples tras IDENTIFIED BY.',
          line: lineNum
        });
      }

      // Check GRANT ALL ON *.*
      if (/GRANT\s+ALL\s+(?:PRIVILEGES\s+)?ON\s+\*\.\*/i.test(cleanLine)) {
        diagnostics.push({
          type: 'warning',
          message: 'Línea ' + lineNum + ': GRANT ALL ON *.* otorga control irrestricto de toda la instancia MySQL (Anti-patrón de seguridad).',
          line: lineNum
        });
      }
    } else {
      // SQL Server
      if (/CREATE\s+USER/i.test(cleanLine) && !/FOR\s+LOGIN|WITHOUT\s+LOGIN/i.test(code.toUpperCase())) {
        diagnostics.push({
          type: 'warning',
          message: 'Línea ' + lineNum + ': En SQL Server, CREATE USER en una BD debe vincularse a un LOGIN con la cláusula FOR LOGIN.',
          line: lineNum
        });
      }

      if (/ON\s+\*\.\*/i.test(cleanLine)) {
        diagnostics.push({
          type: 'error',
          message: 'Línea ' + lineNum + ': La sintaxis "*.*" no es válida en SQL Server. Se usa [ON DATABASE::bd] o [ON SCHEMA::dbo] o [ON objeto].',
          line: lineNum
        });
      }
    }
  });

  return diagnostics;
}

export function extractPrivilegeMappings(code: string, engine: SQLEngine): PrivilegeMapping[] {
  const mappings: PrivilegeMapping[] = [];
  const lines = code.split('\n');

  lines.forEach(line => {
    const clean = line.trim();
    if (!clean || clean.startsWith('--')) return;

    if (engine === 'mysql') {
      // Match GRANT <privs> ON <target> TO <user>
      const grantMatch = clean.match(/GRANT\s+([\w\s,]+)\s+ON\s+([`\w.*]+)\s+TO\s+([^;]+)/i);
      if (grantMatch) {
        const privs = grantMatch[1].trim();
        const target = grantMatch[2].trim();
        const toClause = grantMatch[3].trim();
        mappings.push({
          action: 'GRANT',
          privilegeType: privs,
          targetObject: target,
          principalName: toClause
        });
      }

      // Match REVOKE <privs> ON <target> FROM <user>
      const revokeMatch = clean.match(/REVOKE\s+([\w\s,]+)\s+ON\s+([`\w.*]+)\s+FROM\s+([^;]+)/i);
      if (revokeMatch) {
        mappings.push({
          action: 'REVOKE',
          privilegeType: revokeMatch[1].trim(),
          targetObject: revokeMatch[2].trim(),
          principalName: revokeMatch[3].trim()
        });
      }
    } else {
      // SQL Server GRANT / DENY / REVOKE
      const sqlServerMatch = clean.match(/(GRANT|DENY|REVOKE)\s+([\w\s,]+)\s+ON\s+([\[\]\w.:]+)\s+(?:TO|FROM)\s+([^;]+)/i);
      if (sqlServerMatch) {
        const action = sqlServerMatch[1].toUpperCase() as 'GRANT' | 'REVOKE' | 'DENY';
        mappings.push({
          action,
          privilegeType: sqlServerMatch[2].trim(),
          targetObject: sqlServerMatch[3].trim(),
          principalName: sqlServerMatch[4].trim()
        });
      }
    }
  });

  return mappings;
}
