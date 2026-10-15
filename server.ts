import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface RuleCheckResult {
  status: 'Correcto' | 'Requiere Corrección' | 'Error Crítico';
  syntaxAndLogic: string[];
  pedagogicalHint: string;
  securityObservation: string;
  consoleSimulation?: string;
  rawMarkdown: string;
}

// Deterministic offline rule checker (robust fallback and instant pre-flight)
function evaluateLocally(code: string, engine: 'mysql' | 'sqlserver', taskGoal?: string): RuleCheckResult {
  const issues: string[] = [];
  const securityIssues: string[] = [];
  let hints: string[] = [];
  let isCritical = false;

  const trimmed = code.trim();
  const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('--'));

  if (lines.length === 0) {
    return {
      status: 'Error Crítico',
      syntaxAndLogic: ['No se ha detectado ninguna instrucción SQL en el envío.'],
      pedagogicalHint: 'Ingresa al menos una sentencia DCL para creación de usuario, gestión de privilegios o roles.',
      securityObservation: 'El script está vacío. No se pueden aplicar controles de acceso.',
      rawMarkdown: `📊 **Estado:** Error Crítico\n\n🔍 **Análisis de Sintaxis y Lógica:**\n1. Script vacío: no se detectaron instrucciones DCL.\n\n💡 **Pista Pedagógica:**\nRevisa la sintaxis requerida para gestionar usuarios y privilegios en ${engine === 'mysql' ? 'MySQL' : 'SQL Server'}.\n\n🛡️ **Observación de Seguridad:**\nNo existen sentencias para evaluar.`
    };
  }

  const upperCode = code.toUpperCase();

  if (engine === 'mysql') {
    // 1. Host definition check
    const hasCreateUser = upperCode.includes('CREATE USER');
    if (hasCreateUser) {
      // Check if user definition misses '@'
      const createUserRegex = /CREATE\s+USER\s+([`'"]?[a-zA-Z0-9_-]+[`'"]?)(?:\s+IDENTIFIED|\s*;|\s*,|\s*$)/i;
      const match = code.match(createUserRegex);
      if (match && !match[0].includes('@')) {
        issues.push(`Definición de Host: En MySQL, omitir el host (ej. 'usuario'@'localhost' o 'usuario'@'192.168.1.%') causa inconsistencias en el ámbito de conexión.`);
        hints.push(`Revisa cómo MySQL identifica las cuentas de usuario: se componen de dos partes esenciales: el nombre de usuario y el host desde donde se conectará.`);
      }

      // Check unquoted numeric or raw password
      const badPasswordRegex = /IDENTIFIED\s+BY\s+(\d+|[a-zA-Z0-9]+)(?:;|\s|$)/i;
      const pwdMatch = code.match(badPasswordRegex);
      if (pwdMatch && !code.includes(`IDENTIFIED BY '`) && !code.includes(`IDENTIFIED BY "`)) {
        issues.push(`Sintaxis de Contraseña: La cláusula IDENTIFIED BY requiere comillas simples delimitando la contraseña.`);
        hints.push(`Las credenciales y cadenas alfanuméricas deben estar delimitadas por comillas para cumplir con la gramática de MySQL.`);
      }
    }

    // 2. Weak password checks
    const weakPasswords = ['12345', '123456', 'admin', 'root', 'password', 'qwerty'];
    for (const weak of weakPasswords) {
      if (new RegExp(`IDENTIFIED\\s+BY\\s+['"]?${weak}['"]?`, 'i').test(code)) {
        securityIssues.push(`Contraseña Débil: Se detectó el uso de una contraseña trivial ('${weak}'). Viola las políticas mínimas de seguridad.`);
        break;
      }
    }

    // 3. Excessive global privileges
    if (/GRANT\s+ALL\s+(?:PRIVILEGES\s+)?ON\s+\*\.\*/i.test(code)) {
      securityIssues.push(`Otorgar permisos globales (*.*) con GRANT ALL PRIVILEGES expone todas las bases de datos del servidor y la tabla interna mysql.`);
      hints.push(`Aplica el principio de mínimo privilegio: restringe los permisos únicamente a la base de datos o tablas requeridas por la práctica (ej. nombre_bd.* en lugar de *.*).`);
      issues.push(`Ámbito de Privilegios: Se otorgaron privilegios globales (*.*) a una cuenta ordinaria.`);
    }

    // 4. FLUSH PRIVILEGES
    if (upperCode.includes('GRANT') && !upperCode.includes('FLUSH PRIVILEGES')) {
      securityIssues.push(`Buena práctica recomendada: ejecutar 'FLUSH PRIVILEGES;' tras operaciones DCL para forzar la recarga de las tablas de permisos en memoria.`);
    }

    // 5. Syntax errors: unclosed quotes
    const singleQuotes = (code.match(/'/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      issues.push(`Sintaxis: Se detectó un número impar de comillas simples ('), lo cual provocará un error de parseo en MySQL.`);
      isCritical = true;
    }
  } else {
    // SQL Server checks
    const hasCreateUser = upperCode.includes('CREATE USER');
    const hasCreateLogin = upperCode.includes('CREATE LOGIN');

    // Confusing Login vs User
    if (hasCreateUser && !hasCreateLogin && !upperCode.includes('FOR LOGIN') && !upperCode.includes('WITHOUT LOGIN')) {
      issues.push(`Arquitectura de Identidades: En SQL Server, un usuario de base de datos generalmente requiere asociarse a un Login de servidor mediante 'CREATE USER [usuario] FOR LOGIN [login]'.`);
      hints.push(`Recuerda la separación en SQL Server entre autenticación a nivel de instancia (Servidor -> CREATE LOGIN en master) y autorización a nivel de catálogo (Base de datos -> USE [bd]; CREATE USER ... FOR LOGIN ...).`);
    }

    if (hasCreateLogin && !upperCode.includes('PASSWORD')) {
      issues.push(`Sintaxis de CREATE LOGIN: Falta la cláusula WITH PASSWORD = '...' para la autenticación SQL Server.`);
    }

    // Missing GO or block separation
    if ((hasCreateLogin && hasCreateUser) && !upperCode.includes('GO')) {
      issues.push(`Delimitación de Lotes: Se recomienda separar la creación del Login, el cambio de contexto de base de datos (USE [bd]) y el CREATE USER mediante el comando de lote 'GO'.`);
      hints.push(`¿Por qué SQL Server evalúa las sentencias en lotes (batches)? Analiza cómo interactúa el cambio de contexto USE con las siguientes sentencias.`);
    }

    // Weak passwords in SQL Server
    if (/PASSWORD\s*=\s*['"](12345|123456|admin|password)['"]/i.test(code)) {
      securityIssues.push(`Contraseña insegura detectada en WITH PASSWORD. SQL Server aplicará por defecto CHECK_POLICY = ON y rechazará contraseñas triviales.`);
    }

    // Unnecessary sysadmin / CONTROL SERVER
    if (upperCode.includes('SYSADMIN') || upperCode.includes('CONTROL SERVER')) {
      securityIssues.push(`Asignar el rol fijo 'sysadmin' o el permiso 'CONTROL SERVER' confiere control total de la instancia y anula las defensas de la organización.`);
      hints.push(`Analiza los roles fijos de base de datos (ej. db_datareader, db_datawriter) o permisos específicos en lugar de roles de servidor absolutos.`);
    }
  }

  let status: 'Correcto' | 'Requiere Corrección' | 'Error Crítico' = 'Correcto';
  if (isCritical) {
    status = 'Error Crítico';
  } else if (issues.length > 0 || securityIssues.length > 1) {
    status = 'Requiere Corrección';
  }

  let simulation = '';
  if (status === 'Correcto') {
    if (engine === 'mysql') {
      simulation = `mysql> -- Verificando privilegios asignados en el catálogo:\nmysql> SHOW GRANTS FOR 'usuario'@'localhost';\n+-------------------------------------------------------------+\n| Grants for usuario@localhost                                |\n+-------------------------------------------------------------+\n| GRANT USAGE ON *.* TO \`usuario\`@\`localhost\`                 |\n| GRANT SELECT, INSERT ON \`taller_db\`.* TO \`usuario\`@\`localhost\` |\n+-------------------------------------------------------------+\n2 rows in set (0.01 sec)\n\nmysql> FLUSH PRIVILEGES;\nQuery OK, 0 rows affected (0.00 sec)`;
    } else {
      simulation = `1> -- Verificando principal de servidor y usuario de base de datos:\n2> SELECT name, type_desc FROM sys.server_principals WHERE name = 'desarrollador_login';\n3> GO\nname                  type_desc\n-------------------   ------------------------\ndesarrollador_login   SQL_LOGIN\n\n(1 row affected)\n1> USE taller_db;\n2> SELECT dp.name AS UserName, p.permission_name, p.state_desc\n3> FROM sys.database_permissions p\n4> JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id;\n5> GO\nUserName        permission_name   state_desc\n-------------   ---------------   ----------\ndesarrollador   SELECT            GRANT\n\n(1 row affected)`;
    }
  }

  const analysisFormatted = issues.length > 0
    ? issues.map((iss, idx) => `${idx + 1}. ${iss}`).join('\n')
    : 'No se encontraron errores de sintaxis ni de estructura conceptual en las sentencias enviadas.';

  const hintFormatted = hints.length > 0
    ? hints.join(' ')
    : 'Has aplicado adecuadamente la delimitación y los roles conforme a la especificación de la práctica.';

  const securityFormatted = securityIssues.length > 0
    ? securityIssues.join(' ')
    : 'Se respeta el principio de mínimo privilegio y delimitación del catálogo.';

  const rawMarkdown = `📊 **Estado:** ${status}\n\n🔍 **Análisis de Sintaxis y Lógica:**\n${analysisFormatted}\n\n💡 **Pista Pedagógica:**\n${hintFormatted}\n\n🛡️ **Observación de Seguridad:**\n${securityFormatted}${status === 'Correcto' ? `\n\n💻 **Simulación en Consola:**\n\`\`\`sql\n${simulation}\n\`\`\`` : ''}`;

  return {
    status,
    syntaxAndLogic: issues.length > 0 ? issues : ['Sintaxis y estructura lógica validadas con éxito.'],
    pedagogicalHint: hintFormatted,
    securityObservation: securityFormatted,
    consoleSimulation: simulation,
    rawMarkdown,
  };
}

// Evaluation endpoint
app.post('/api/evaluate-dcl', async (req, res) => {
  try {
    const { code, engine, taskContext } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'El campo "code" es requerido y debe ser una cadena de texto.' });
      return;
    }

    const targetEngine: 'mysql' | 'sqlserver' = engine === 'sqlserver' ? 'sqlserver' : 'mysql';

    // If Gemini client is available, run prompt-grounded analysis
    if (aiClient) {
      try {
        const systemInstruction = `Eres un evaluador automático y tutor riguroso para la materia Taller de Bases de Datos.
Tu función es analizar el código SQL (DCL) enviado por los estudiantes para MySQL o SQL Server referente a la creación de usuarios, asignación/revocación de privilegios y gestión de roles.

Reglas estrictas de evaluación:
1. Analiza el código buscando:
   - Errores de sintaxis (comas faltantes, comillas mal puestas, palabras clave incorrectas, delimitadores).
   - Errores conceptuales en MySQL: confusión de 'usuario'@'host', falta de FLUSH PRIVILEGES cuando aplique, mala sintaxis en IDENTIFIED BY.
   - Errores conceptuales en SQL Server: no diferenciar entre CREATE LOGIN (servidor) y CREATE USER (base de datos), falta de cláusula FOR LOGIN, falta de GO/bloques de lotes, uso de sintaxis ajena a T-SQL.
   - Malas prácticas de seguridad: contraseñas débiles, uso de GRANT ALL PRIVILEGES innecesario o falta de delimitación de base de datos (*.* en lugar de db.*).

2. Estructura de tu respuesta (MUY IMPORTANTE: NO entregues el código corregido de inmediato, guía al alumno para que reflexione con preguntas o principios teóricos):
   Debes devolver un JSON estructurado con los siguientes campos exactos:
   - status: "Correcto" | "Requiere Corrección" | "Error Crítico"
   - syntaxAndLogic: lista de strings detallando cada falla en qué línea o instrucción está y por qué falla (o confirmación si está correcto).
   - pedagogicalHint: explicación del concepto teórico que debe revisar sin darle la respuesta directa (guía socrática).
   - securityObservation: observación de seguridad sobre contraseñas, permisos globales o alcance.
   - consoleSimulation: si el estado es "Correcto", simulación detallada del resultado en la consola (mysql> o sqlcmd/SSMS) con comandos de verificación (ej. SHOW GRANTS o sys.database_permissions). Si no es correcto, dejar vacío o null.
   - rawMarkdown: la respuesta en el formato exacto de texto solicitado:
📊 **Estado:** [Correcto | Requiere Corrección | Error Crítico]

🔍 **Análisis de Sintaxis y Lógica:**
[Detalle numerado o con viñetas]

💡 **Pista Pedagógica:**
[Explicación teórica reflexiva]

🛡️ **Observación de Seguridad:**
[Observaciones]
(Y si es correcto, incluye el bloque de simulación de consola)

3. Mantén un tono académico, formal, riguroso pero motivador de docente universitario.`;

        const userPrompt = `Motor seleccionado: ${targetEngine === 'mysql' ? 'MySQL 8.0+' : 'Microsoft SQL Server (T-SQL)'}
${taskContext ? `Contexto o Enunciado de la práctica: ${taskContext}\n` : ''}
Código DCL enviado por el estudiante:
\`\`\`sql
${code}
\`\`\`

Evalúa exhaustivamente el código del estudiante siguiendo las reglas del Taller de Bases de Datos.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: {
                  type: Type.STRING,
                  description: 'Estado de la evaluación: "Correcto", "Requiere Corrección", o "Error Crítico"',
                },
                syntaxAndLogic: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Lista de observaciones de sintaxis y lógica',
                },
                pedagogicalHint: {
                  type: Type.STRING,
                  description: 'Pista pedagógica reflexiva que no revela la solución directa',
                },
                securityObservation: {
                  type: Type.STRING,
                  description: 'Observaciones de seguridad y buenas prácticas',
                },
                consoleSimulation: {
                  type: Type.STRING,
                  description: 'Simulación de consola si es correcto',
                },
                rawMarkdown: {
                  type: Type.STRING,
                  description: 'Salida completa con formato markdown idéntico al solicitado',
                },
              },
              required: ['status', 'syntaxAndLogic', 'pedagogicalHint', 'securityObservation', 'rawMarkdown'],
            },
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          res.json({
            success: true,
            source: 'gemini',
            evaluation: parsed,
          });
          return;
        } catch (jsonErr) {
          console.error('Failed to parse Gemini JSON output, falling back to local evaluator:', jsonErr);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed or timed out, executing local rule-based tutor:', geminiErr);
      }
    }

    // Fallback to local deterministic tutor
    const localResult = evaluateLocally(code, targetEngine, taskContext);
    res.json({
      success: true,
      source: 'local-tutor',
      evaluation: localResult,
    });
  } catch (err: any) {
    console.error('Internal error evaluating DCL code:', err);
    res.status(500).json({ error: 'Error interno al evaluar el código DCL.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DCL Tutor Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
