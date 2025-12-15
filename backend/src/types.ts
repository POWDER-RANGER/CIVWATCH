// src/types.ts

export type DataPoint = {
  id: string;
  timestamp: string;
  value: number;
  tags?: string[];
};

export type AnalysisResult = {
  summary: string;
  confidence: number;
  affectedEntities: string[];
  details?: Record<string, any>;
};

export type TrendData = {
  metric: string;
  history: Array<{ timestamp: string; value: number }>;
  trend: 'up' | 'down' | 'stable';
};
