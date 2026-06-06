/**
 * ScoreDistributionChart
 *
 * Score histogram (10 bins, 0.0–1.0).
 * Bins are colored by severity: green / amber / red.
 * Clicking a bin sets the dashboard minScore filter to that bin's lower bound.
 * syncId="anomaly-sync" ties hover state to AnomalyTimelineChart.
 */
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import type { ScoreBin } from './chartModel';

const TOOLTIP_STYLE = { background: '#111', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 };

function binColor(min: number): string {
  if (min >= 0.85) return '#ef4444';
  if (min >= 0.60) return '#f59e0b';
  return '#22c55e';
}

interface Props {
  data:               ScoreBin[];
  selectedMinScore:   number;
  onSelectMinScore:   (n: number) => void;
}

export function ScoreDistributionChart({ data, selectedMinScore, onSelectMinScore }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} syncId="anomaly-sync" margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
        <XAxis dataKey="bucket" tick={{ fill: '#94a3b8', fontSize: 9 }} />
        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell
              key={d.bucket}
              fill={binColor(d.min)}
              fillOpacity={selectedMinScore === d.min ? 1 : 0.65}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectMinScore(selectedMinScore === d.min ? 0 : d.min)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
