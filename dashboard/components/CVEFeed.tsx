
'use client';

import React from 'react';
import { CVE } from '@/lib/mockData';
import { AlertCircle, ShieldAlert, BadgeInfo, Zap, Clock } from 'lucide-react';
import clsx from 'clsx';
import { timeAgo, truncate, getSeverityStyle } from '@/lib/cveUtils';

interface CVEFeedProps {
  cves: CVE[];
  onSearch?: (query: string) => void;
}

const CVEFeed: React.FC<CVEFeedProps> = ({ cves, onSearch }) => {
  return (
    <div className="bg-[#0B1120] border border-gray-800 rounded-md p-4 h-full overflow-y-auto custom-scrollbar">
      <h3 className="text-red-500 text-sm md:text-base font-bold uppercase mb-4 flex items-center gap-2 flex-wrap">
        <ShieldAlert size={16} />
        <span className="flex-1">Live & Exploited Vulnerabilities</span>
        <span className="text-[10px] text-gray-500 animate-pulse bg-gray-900/50 px-2 py-0.5 rounded border border-gray-800">LIVE UPDATE</span>
      </h3>
      <div className="space-y-4">
        {cves.map((cve) => {
          const severityStyle = getSeverityStyle(cve.score ?? null);
          const timeDisplay = timeAgo(cve.rawDate || cve.published);

          return (
            <div key={cve.id} className={clsx(
                "border-l-2 pl-3 py-2 animate-in fade-in slide-in-from-right-4 duration-500 rounded-r-md transition-colors hover:bg-white/5",
                cve.isExploited 
                  ? "border-red-600 bg-red-900/10" 
                  : `border-${severityStyle.border.split('-')[1]}-900` // Fallback or dynamic
            )}
            style={{ borderLeftColor: cve.isExploited ? '#dc2626' : undefined }}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-blue-400 font-mono text-sm md:text-base font-bold cursor-pointer hover:underline break-all"
                      onClick={() => onSearch && onSearch(cve.cveId)}
                    >
                      {cve.cveId}
                    </span>
                    {cve.isExploited && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded shadow-lg shadow-red-900/50 animate-pulse">
                            <AlertCircle size={10} /> EXPLOITED
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                   {cve.score !== null && cve.score !== undefined && (
                      <span className={clsx(
                        "text-xs px-2 py-0.5 rounded font-bold font-mono",
                        severityStyle.bg,
                        severityStyle.color,
                        severityStyle.border,
                        "border"
                      )}>
                        CVSS {cve.score}
                      </span>
                   )}
                   {severityStyle.label !== 'UNKNOWN' && (
                     <span className={clsx(
                        "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                        severityStyle.color
                     )}>
                        {severityStyle.label}
                     </span>
                   )}
                </div>
              </div>
              
              <p className="text-gray-300 text-xs md:text-sm mb-3 leading-relaxed opacity-90">
                  {truncate(cve.description, 140)}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                 {cve.affectedSystems.slice(0, 4).map((sys, i) => (
                   <span 
                      key={i} 
                      className="text-[10px] bg-gray-800/50 text-blue-200/80 border border-gray-700/50 px-2 py-0.5 rounded-full hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => onSearch && onSearch(sys)}
                   >
                     {sys}
                   </span>
                 ))}
                 {cve.affectedSystems.length > 4 && (
                    <span className="text-[10px] text-gray-500 py-0.5">+{cve.affectedSystems.length - 4} more</span>
                 )}
              </div>
              
              <div className="text-gray-500 text-xs mt-2 flex flex-col sm:flex-row sm:justify-between gap-1 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                      <Clock size={12} /> {timeDisplay} 
                      <span className="opacity-50 mx-1">|</span> 
                      {cve.published}
                  </span>
                  {cve.isExploited && <span className="text-red-400 font-bold flex items-center gap-1"><Zap size={10} fill="currentColor" /> Active Threat In-Wild</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CVEFeed);
