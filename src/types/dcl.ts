export type SQLEngine = 'mysql' | 'sqlserver';

export type EvaluationStatus = 'Correcto' | 'Requiere Corrección' | 'Error Crítico';

export interface EvaluationResponse {
  status: EvaluationStatus;
  syntaxAndLogic: string[];
  pedagogicalHint: string;
  securityObservation: string;
  consoleSimulation?: string;
  rawMarkdown: string;
}

export interface EvaluationRecord {
  id: string;
  timestamp: string;
  engine: SQLEngine;
  code: string;
  response: EvaluationResponse;
  source: 'gemini' | 'local-tutor';
}

export interface LabExercise {
  id: string;
  title: string;
  engine: SQLEngine;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  goal: string;
  requirements: string[];
  initialCode: string;
  hints: string[];
  referenceSolution?: string; // Hidden from student, for teacher guidance
}
