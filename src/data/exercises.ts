import { LabExercise } from '../types/dcl';

export const LAB_EXERCISES: LabExercise[] = [
  {
    id: 'ref-prompt-example',
    title: 'Ejemplo de Referencia: Desarrollador Básico (MySQL)',
    engine: 'mysql',
    difficulty: 'Básico',
    goal: 'Crear una cuenta de usuario para un desarrollador local y otorgarle privilegios de desarrollo en la base de datos de prácticas.',
    requirements: [
      'Definir adecuadamente el ámbito de conexión (host local).',
      'Asignar una contraseña con comillas simples.',
      'Evitar privilegios globales (*.*) innecesarios.',
      'Delimitar a la base de datos de práctica: `taller_db`.*.',
      'Ejecutar FLUSH PRIVILEGES.'
    ],
    initialCode: `-- Código con errores típicos de sintaxis y seguridad:
CREATE USER desarrollador IDENTIFIED BY 12345;
GRANT ALL ON *.* TO desarrollador;`,
    hints: [
      'En MySQL, el nombre de usuario debe ir acompañado de su host de origen, por ejemplo: \'desarrollador\'@\'localhost\'.',
      '¿Qué riesgo representa el uso del comodín *.* frente a delimitar el acceso a taller_db.*?',
      'Las contraseñas en MySQL deben ir encerradas en comillas simples.'
    ]
  },
  {
    id: 'mysql-pos-operator',
    title: 'Práctica 1: Cajero de Punto de Venta (MySQL)',
    engine: 'mysql',
    difficulty: 'Básico',
    goal: 'Crear el usuario \'cajero_pos\'@\'localhost\' con permisos estrictamente necesarios para cobrar ventas en la base de datos `sucursal_db`. Solo debe poder consultar catálogo (`SELECT` en productos) e insertar ventas (`INSERT`, `SELECT` en `ventas`).',
    requirements: [
      'Crear la cuenta limitándola a localhost con una contraseña robusta.',
      'No otorgar permisos globales ni privilegios destructivos (DROP, ALTER, DELETE).',
      'Otorgar permisos a nivel de objeto o tabla específica.',
      'Ejecutar FLUSH PRIVILEGES al finalizar.'
    ],
    initialCode: `-- Ingresa tu solución DCL para el cajero:
CREATE USER 'cajero_pos'@'localhost' IDENTIFIED BY 'Pos$2026Secure';
GRANT SELECT ON sucursal_db.productos TO 'cajero_pos'@'localhost';
GRANT INSERT, SELECT ON sucursal_db.ventas TO 'cajero_pos'@'localhost';
FLUSH PRIVILEGES;`,
    hints: [
      'Verifica si el usuario requiere acceso desde cualquier host o únicamente la terminal de caja local.',
      'Recuerda que el principio de menor privilegio previene que un cajero borre accidentalmente el catálogo de productos.'
    ]
  },
  {
    id: 'sqlserver-login-vs-user',
    title: 'Práctica 2: Arquitectura Login vs User (SQL Server)',
    engine: 'sqlserver',
    difficulty: 'Intermedio',
    goal: 'Crear el acceso para un analista de soporte técnico en SQL Server. Se requiere un Login a nivel de servidor y su correspondiente User en la base de datos `inventario_db`, asignándole el rol de lectura `db_datareader`.',
    requirements: [
      'Crear el LOGIN en el servidor con contraseña segura.',
      'Cambiar el contexto a la base de datos `inventario_db` usando USE.',
      'Separar los lotes de ejecución mediante el comando GO.',
      'Crear el USER asociado al LOGIN.',
      'Asignar el rol predefinido `db_datareader` con ALTER ROLE ... ADD MEMBER.'
    ],
    initialCode: `-- Error común: crear el USER directamente sin LOGIN ni cambio de BD:
CREATE USER soporte_user WITH PASSWORD = 'Password123!';
GRANT SELECT ON *.* TO soporte_user;`,
    hints: [
      'En SQL Server, un LOGIN autentica contra la instancia completa (master), mientras que un USER autoriza dentro de una base de datos específica.',
      '¿Existe la sintaxis "*.*" en SQL Server o pertenece a MySQL?',
      'Revisa el uso de la instrucción GO para separar el cambio de catálogo USE de la creación del usuario.'
    ]
  },
  {
    id: 'mysql-roles-management',
    title: 'Práctica 3: Gestión de Roles en MySQL 8.0',
    engine: 'mysql',
    difficulty: 'Intermedio',
    goal: 'Crear un rol llamado `rol_consultor`, otorgarle permiso SELECT sobre la base de datos `auditoria_db`, y asignarlo al usuario `maria`@\'%\'. Activar el rol por defecto.',
    requirements: [
      'Crear el rol con CREATE ROLE.',
      'Asignar los permisos al rol con GRANT.',
      'Asignar el rol al usuario.',
      'Configurar SET DEFAULT ROLE para que el usuario no necesite activarlo manualmente.'
    ],
    initialCode: `-- Intento de gestión de roles:
CREATE ROLE 'rol_consultor';
GRANT SELECT ON auditoria_db.* TO 'rol_consultor';
CREATE USER 'maria'@'%' IDENTIFIED BY 'Auditor#2026!';
GRANT 'rol_consultor' TO 'maria'@'%';
SET DEFAULT ROLE 'rol_consultor' TO 'maria'@'%';
FLUSH PRIVILEGES;`,
    hints: [
      'En MySQL 8.0, un rol puede ser asignado a uno o más usuarios, pero permanece inactivo a menos que se configure SET DEFAULT ROLE o se active en la sesión.'
    ]
  },
  {
    id: 'sqlserver-deny-revoke',
    title: 'Práctica 4: Denegación Explícita DENY (SQL Server)',
    engine: 'sqlserver',
    difficulty: 'Avanzado',
    goal: 'Configurar permisos para un pasante en SQL Server. El usuario pertenece al rol `db_datareader`, pero por estricta política de confidencialidad se le debe prohibir terminantemente ver la tabla `Nomina_Sueldos`.',
    requirements: [
      'Comprender la jerarquía de permisos en SQL Server: DENY tiene precedencia absoluta sobre GRANT.',
      'Aplicar la sentencia DENY SELECT ON Nomina_Sueldos TO [usuario].'
    ],
    initialCode: `-- Configuración de permisos y denegación:
USE contabilidad_db;
GO

-- Suponiendo que el usuario ya existe en la BD:
DENY SELECT ON dbo.Nomina_Sueldos TO pasante_rh;
GO`,
    hints: [
      '¿Cuál es la diferencia conceptual entre REVOKE (quitar un permiso previo) y DENY (impedir activamente la acción aunque un rol lo otorgue)?'
    ]
  }
];

export const PRESET_CODE_SNIPPETS: { label: string; engine: 'mysql' | 'sqlserver'; code: string }[] = [
  {
    label: 'Caso 1: Error clásico de referencia (Prompt del Profesor)',
    engine: 'mysql',
    code: `CREATE USER desarrollador IDENTIFIED BY 12345;
GRANT ALL ON *.* TO desarrollador;`
  },
  {
    label: 'Caso 2: MySQL - Solución correcta con delimitación y host',
    engine: 'mysql',
    code: `CREATE USER 'desarrollador'@'localhost' IDENTIFIED BY 'Dev#Prac2026_Secure';
GRANT SELECT, INSERT, UPDATE ON taller_db.* TO 'desarrollador'@'localhost';
FLUSH PRIVILEGES;`
  },
  {
    label: 'Caso 3: SQL Server - Error típico de novato (User sin Login)',
    engine: 'sqlserver',
    code: `CREATE USER dev_sql WITH PASSWORD = 12345;
GRANT ALL PRIVILEGES ON *.* TO dev_sql;`
  },
  {
    label: 'Caso 4: SQL Server - Estructura canónica Login + User + Rol',
    engine: 'sqlserver',
    code: `CREATE LOGIN dev_login WITH PASSWORD = 'Dev$2026_TallerServerKey!', CHECK_POLICY = ON;
GO

USE taller_db;
GO

CREATE USER dev_user FOR LOGIN dev_login;
GO

ALTER ROLE db_datareader ADD MEMBER dev_user;
ALTER ROLE db_datawriter ADD MEMBER dev_user;
GO`
  },
  {
    label: 'Caso 5: MySQL - Rol y Privilegios Específicos',
    engine: 'mysql',
    code: `CREATE ROLE 'rol_ventas';
GRANT SELECT, INSERT ON tienda_db.pedidos TO 'rol_ventas';
CREATE USER 'vendedor1'@'192.168.1.%' IDENTIFIED BY 'Vend#Pass2026!';
GRANT 'rol_ventas' TO 'vendedor1'@'192.168.1.%';
SET DEFAULT ROLE 'rol_ventas' TO 'vendedor1'@'192.168.1.%';
FLUSH PRIVILEGES;`
  }
];
