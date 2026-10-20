import { describe, it, expect } from '@jest/globals';
import { mean, stddev, zScore, analyzeFeatures, FeatureVector } from '../src/analysis/dataAnalyzer';

const fv = (id: string, value: number, category = 'presence', geocell: string | null = 'abc12345'): FeatureVector => ({
  civic_record_id: id,
  source_id:       '00000000-0000-0000-0000-000000000000',
  category,
  geocell,
  occurred_at:     new Date('2026-01-01T00:00:00Z'),
  value,
});

describe('dataAnalyzer statistics', () => {
  it('computes mean and population stddev', () => {
    const points = [10, 12, 11, 13, 9];
    expect(mean(points)).toBeCloseTo(11, 5);
    expect(stddev(points)).toBeCloseTo(Math.SQRT2, 5);
  });

  it('returns 0 for empty / single-value inputs', () => {
    expect(mean([])).toBe(0);
    expect(stddev([5])).toBe(0);
  });

  it('computes z-score and guards against zero sigma', () => {
    expect(zScore(20, 11, Math.SQRT2)).toBeGreaterThan(2);
    expect(zScore(5, 5, 0)).toBe(0);
  });
});

describe('analyzeFeatures', () => {
  it('flags an outlier within its category+geocell group', () => {
    const features = [
      ...Array.from({ length: 20 }, (_, i) => fv(`n${i}`, 10 + (i % 3))),
      fv('outlier', 100),
    ];
    const results = analyzeFeatures(features);
    const outlier = results.find((r) => r.civic_record_id === 'outlier')!;
    expect(outlier.is_anomalous).toBe(true);
    expect(outlier.z_score).toBeGreaterThan(2.5);
    expect(results.filter((r) => r.is_anomalous)).toHaveLength(1);
  });

  it('computes baselines per group independently', () => {
    const results = analyzeFeatures([
      fv('a1', 10, 'presence'), fv('a2', 10, 'presence'),
      fv('b1', 500, 'checkpoint'), fv('b2', 500, 'checkpoint'),
    ]);
    expect(results.every((r) => !r.is_anomalous)).toBe(true);
  });

  it('respects a custom threshold', () => {
    const features = [fv('1', 10), fv('2', 10), fv('3', 10), fv('4', 14)];
    expect(analyzeFeatures(features, 1).some((r) => r.is_anomalous)).toBe(true);
    expect(analyzeFeatures(features, 5).some((r) => r.is_anomalous)).toBe(false);
  });
});
