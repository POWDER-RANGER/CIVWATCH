// src/types.ts
export interface User {
  id: string;
  name: string;
}
export type Status = 'active' | 'inactive';

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface AnalysisResult {
  trend: string;
  anomalies: number[];
  summary: string;
}

export interface TrendData {
  points: DataPoint[];
  direction: 'up' | 'down' | 'stable';
}
