
'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { time: '10:00', attacks: 4000 },
  { time: '10:05', attacks: 3000 },
  { time: '10:10', attacks: 2000 },
  { time: '10:15', attacks: 2780 },
  { time: '10:20', attacks: 1890 },
  { time: '10:25', attacks: 2390 },
  { time: '10:30', attacks: 3490 },
  { time: '10:35', attacks: 4000 },
  { time: '10:40', attacks: 5000 },
  { time: '10:45', attacks: 4500 },
  { time: '10:50', attacks: 3800 },
  { time: '10:55', attacks: 4200 },
];

const AttackGraph = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip 
             contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
             itemStyle={{ color: '#f59e0b' }}
          />
          <Area type="monotone" dataKey="attacks" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAttacks)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttackGraph;
