import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../src/db';
import { connectPg } from '../src/db';
import { computeZScore, isAnomaly, analyzeRecord } from '../src/analysis/dataAnalyzer';

describe('dataAnalyzer', () => {
  it('computes correct z-score for normal distribution', () => {
    const points = [10, 12, 11, 13, 9];
    const z = computeZScore(points, 20);
    expect(z.z).toBeGreaterThan(2);
    expect(z.mean).toBeCloseTo(11, 1);
  });

  it('detects anomaly above threshold', () => {
    expect(isAnomaly(3)).toBe(true);
    expect(isAnomaly(-3)).toBe(true);
    expect(isAnomaly(1)).toBe(false);
  });

  it('analyzes record without throwing', async () => {
    await connectPg();
    const result = await analyzeRecord({
      timestamp: new Date().toISOString(),
      source: 'test-source',
      category: 'test',
      value: 15,
    });
    expect(result).toHaveProperty('anomaly');
    expect(result).toHaveProperty('zScore');
  });
});
