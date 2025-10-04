// TODO: Add comprehensive documentation for this module
// REFACTOR: Consider breaking this into smaller, more focused modules

import { DataPoint, AnalysisResult, TrendData } from '../types';

export class DataAnalyzer {
  private cache: Map<string, any>;
  
  constructor() {
    this.cache = new Map();
  }
  
  // TODO: Add JSDoc documentation
  // REFACTOR: Extract validation logic into separate method
  analyzeTimeSeries(data: DataPoint[]): AnalysisResult {
    const trends = this.calculateTrends(data);
    const anomalies = this.detectAnomalies(data);
    const stats = this.computeStatistics(data);
    
    return {
      trends,
      anomalies,
      statistics: stats,
      timestamp: new Date()
    };
  }
  
  // TODO: Document parameters and return type
  private calculateTrends(data: DataPoint[]): TrendData[] {
    const windowSize = 7;
    const trends: TrendData[] = [];
    
    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const average = window.reduce((sum, d) => sum + d.value, 0) / windowSize;
      
      trends.push({
        timestamp: data[i].timestamp,
        value: average,
        direction: this.getTrendDirection(window)
      });
    }
    
    return trends;
  }
  
  // TODO: Add documentation explaining the algorithm
  private detectAnomalies(data: DataPoint[]): DataPoint[] {
    const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    const variance = data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const threshold = 2;
    
    return data.filter(d => Math.abs(d.value - mean) > threshold * stdDev);
  }
  
  private getTrendDirection(window: DataPoint[]): 'up' | 'down' | 'stable' {
    const firstHalf = window.slice(0, Math.floor(window.length / 2));
    const secondHalf = window.slice(Math.floor(window.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.05) return 'up';
    if (secondAvg < firstAvg * 0.95) return 'down';
    return 'stable';
  }
  
  // TODO: Add documentation and examples
  private computeStatistics(data: DataPoint[]) {
    const values = data.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { mean, median, min, max, count: values.length };
  }
}

// TODO: Document this utility function
export function normalizeData(data: DataPoint[]): DataPoint[] {
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  return data.map(d => ({
    ...d,
    value: range === 0 ? 0 : (d.value - min) / range
  }));
}

// TODO: Add documentation for aggregation function
export function aggregateByTimeWindow(data: DataPoint[], windowMs: number): DataPoint[] {
  const windows = new Map<number, DataPoint[]>();
  
  data.forEach(point => {
    const windowKey = Math.floor(point.timestamp.getTime() / windowMs);
    if (!windows.has(windowKey)) {
      windows.set(windowKey, []);
    }
    windows.get(windowKey)!.push(point);
  });
  
  return Array.from(windows.entries()).map(([key, points]) => ({
    timestamp: new Date(key * windowMs),
    value: points.reduce((sum, p) => sum + p.value, 0) / points.length,
    metadata: { count: points.length }
  }));
}
