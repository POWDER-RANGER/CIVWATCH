/**
 * SourceBreakdownChart
 *
 * Horizontal bar chart showing top-8 sources by anomaly count.
 * Clicking a bar toggles source filter in the dashboard.
 * Active source bar is highlighted at full opacity; others are dimmed.
 */
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import type { SourceRow } from './chartModel';

const TOOLTIP_STYLE = { background: '#111', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 };

interface Props {
  data:            SourceRow[];
  selectedSource:  string | null;
  onSelectSource:  (s: string | null) => void;
}

export function SourceBreakdownChart({ data, selectedSource, onSelectSource }: Props) {
  if (data.length === 0) {
    return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>No source data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <YAxis
          type="category" dataKey="source" width={110}
          tick={{ fill: '#e2e8f0', fontSize: 10 }}
          tickFormatter={(v: string) => v.length > 14 ? `${v.slice(0, 13)}…` : v}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" name="Events" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell
              key={d.source}
              fill="#7c3aed"
              fillOpacity={!selectedSource || selectedSource === d.source ? 1 : 0.3}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectSource(selectedSource === d.source ? null : d.source)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
