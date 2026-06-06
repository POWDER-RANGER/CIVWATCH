/**
 * AnomalyTimelineChart
 *
 * ComposedChart: bars for event count + critical count, line for avg score.
 * Red dashed ReferenceLine at the 0.85 critical threshold.
 * syncId="anomaly-sync" ties hover state to ScoreDistributionChart.
 */
import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import type { TimelineBucket } from './chartModel';

const TOOLTIP_STYLE = { background: '#111', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 };

interface Props {
  data: TimelineBucket[];
}

export function AnomalyTimelineChart({ data }: Props) {
  if (data.length === 0) {
    return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>No timeline data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} syncId="anomaly-sync" margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
        <XAxis
          dataKey="ts"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickFormatter={(v: string) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        />
        {/* Left axis: event counts */}
        <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        {/* Right axis: 0–1 score */}
        <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={(v: string) => new Date(v).toLocaleString()}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        {/* Critical threshold band */}
        <ReferenceLine yAxisId="right" y={0.85} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Critical', fill: '#ef4444', fontSize: 10, position: 'right' }} />
        <Bar yAxisId="left" dataKey="count"    name="Events"   fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right" type="monotone" dataKey="avgScore" name="Avg score"
          stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
