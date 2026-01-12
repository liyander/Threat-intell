
'use client';

import React from 'react';
import { CountryStat } from '@/lib/mockData';
import clsx from 'clsx';

interface StatsPanelProps {
  stats: {
      attackers: CountryStat[];
      attacked: CountryStat[];
      vectors: { name: string; percentage: number }[];
  }
}

const StatSection = ({ title, data, type = 'country', color = 'bg-blue-500' }: { 
    title: string; 
    data: CountryStat[] | { name: string; percentage: number }[]; 
    type?: 'country' | 'vector'; 
    color?: string 
}) => {
    return (
        <div className="bg-[#0B1120] border border-gray-800 rounded-md p-4 mb-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">{title}</h3>
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                        {type === 'country' && 'code' in item && (
                            <span className="w-6 text-gray-400 text-xs text-center mr-2">
                                {item.code}
                            </span>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-300 truncate">{'country' in item ? item.country : item.name}</span>
                                <span className="text-gray-400">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={clsx("h-full rounded-full", color)}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatsPanel: React.FC<StatsPanelProps> = React.memo(({ stats }) => {
  return (
    <>
        
        <StatSection title="Top Targets" data={stats.attacked} type="country" color="bg-orange-500" />
        <StatSection title="Attack Vectors" data={stats.vectors} type="vector" color="bg-cyan-500" />
    </>
  );
});

export default StatsPanel;
