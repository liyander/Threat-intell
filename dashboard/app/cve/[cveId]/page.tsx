'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Shield, AlertTriangle, Globe, Server, ExternalLink, Database, Info, Github } from 'lucide-react';

export default function CveDetailPage({ params }: { params: Promise<{ cveId: string }> }) {
    const { cveId } = use(params);
    const router = useRouter();
    
    // CVE Details
    const [cveData, setCveData] = useState<any>(null);
    const [loadingCve, setLoadingCve] = useState(true);
    const [activeSource, setActiveSource] = useState<'merged' | 'nvd' | 'otx' | 'circl'>('merged');

    useEffect(() => {
        const fetchCve = async () => {
             setLoadingCve(true);
             try {
                 const res = await axios.get(`/api/cve/${decodeURIComponent(cveId)}`);
                 setCveData(res.data.data);
             } catch (e) {
                 console.error("Failed to load CVE details", e);
             } finally {
                 setLoadingCve(false);
             }
        };

        if (cveId) {
            fetchCve();
        }
    }, [cveId]);

    const getSeverityColor = (score: number | string) => {
        const s = typeof score === 'string' ? parseFloat(score) : score;
        if (!s) return 'text-slate-500 border-slate-500/50 bg-slate-950/30';
        if (s >= 9) return 'text-red-500 border-red-500/50 bg-red-950/30';
        if (s >= 7) return 'text-orange-500 border-orange-500/50 bg-orange-950/30';
        return 'text-yellow-500 border-yellow-500/50 bg-yellow-950/30';
    };

    if (loadingCve) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Aggregating Intelligence from NVD, Circl.lu, and OTX...</p>
                </div>
            </div>
        );
    }

    // Helper: Get data based on active source tab
    const getDisplayData = () => {
        if (!cveData) return null;
        if (activeSource === 'nvd') return cveData.details.nvd;
        if (activeSource === 'otx') return cveData.details.otx;
        if (activeSource === 'circl') return cveData.details.circl;
        return cveData; // Merged view
    };

    const displayData = getDisplayData();

    return (
        <div className="min-h-screen h-auto bg-[#020617] text-slate-300 p-6 font-sans overflow-y-auto">
            {/* Nav */}
            <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 mb-6 hover:text-white transition-colors text-slate-400"
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {(cveData?.id || decodeURIComponent(cveId)).toString().toUpperCase().startsWith('GHSA') ? (
                                <Github className="text-purple-500" size={32} />
                            ) : (
                                <Shield className="text-cyan-500" size={32} />
                            )}
                            <h1 className="text-3xl font-bold text-white tracking-tight">{cveData?.id || decodeURIComponent(cveId)}</h1>
                            {cveData?.cvss && (
                                <span className={`px-3 py-1 rounded border text-sm font-mono font-bold ${getSeverityColor(cveData.cvss)}`}>
                                    CVSS {cveData.cvss}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4 text-xs font-mono text-slate-500">
                             <span className={cveData?.details?.nvd ? 'text-green-500' : 'text-slate-600'}>
                                ● NVD {cveData?.details?.nvd ? 'Connected' : 'Unavailable'}
                             </span>
                             <span className={cveData?.details?.circl ? 'text-green-500' : 'text-slate-600'}>
                                ● Circl.lu {cveData?.details?.circl ? 'Connected' : 'Unavailable'}
                             </span>
                             <span className={cveData?.details?.otx ? 'text-green-500' : 'text-slate-600'}>
                                ● OTX {cveData?.details?.otx ? 'Connected' : 'Unavailable'}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Description & Primary Info */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Summary Card */}
                        <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Info /> Intelligence Summary
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                {cveData?.summary || "No description available from any source."}
                            </p>
                            <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                <span>Published: {cveData?.published ? new Date(cveData.published).toLocaleDateString() : 'Unknown'}</span>
                            </div>
                        </section>

                       {/* Technical Details (NVD/Circl) */}
                       {(cveData?.details?.nvd?.weaknesses || cveData?.details?.circl?.vulnerable_configuration) && (
                            <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Server size={18} /> Technical Impact
                                </h3>
                                
                                {/* CWEs */}
                                {cveData?.details?.nvd?.weaknesses && (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Weakness Enumeration (CWE)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cveData.details.nvd.weaknesses.map((w: any, i: number) => (
                                                 <span key={i} className="px-2 py-1 bg-slate-800 text-cyan-400 text-xs rounded border border-slate-700 font-mono">
                                                     {w.description?.[0]?.value || w.source}
                                                 </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CPEs */}
                                {(cveData?.details?.nvd?.configurations || cveData?.details?.circl?.vulnerable_configuration) && (
                                     <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Vulnerable Configurations (CPE)</h4>
                                        <div className="max-h-40 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                                            {cveData?.details?.nvd?.configurations ? (
                                                cveData.details.nvd.configurations.flatMap((c: any) => c.nodes).flatMap((n: any) => n.cpeMatch).map((cpe: any, i: number) => (
                                                    <div key={i} className="text-xs font-mono text-slate-400 bg-black/20 p-1 rounded">
                                                        {cpe.criteria}
                                                    </div>
                                                ))
                                            ) : (
                                                cveData?.details?.circl?.vulnerable_configuration?.map((c: string, i: number) => (
                                                    <div key={i} className="text-xs font-mono text-slate-400 bg-black/20 p-1 rounded">
                                                        {c}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                     </div>
                                )}
                            </section>
                       )}
                    </div>

                    {/* Right Column: Threat Context (OTX) */}
                    <div className="space-y-6">
                         <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Database size={14} /> Threat Context
                            </h3>
                            
                            {cveData?.details?.otx?.top_pulses?.length > 0 ? (
                                <div className="space-y-3">
                                    {cveData.details.otx.top_pulses.slice(0, 5).map((pulse: any, i: number) => (
                                        <div key={i} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                                            <h4 className="text-xs font-bold text-cyan-400 mb-1 truncate">{pulse.name}</h4>
                                            <p className="text-[10px] text-slate-400 line-clamp-2">{pulse.description}</p>
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {pulse.tags?.slice(0, 3).map((t: string, ti: number) => (
                                                    <span key={ti} className="text-[9px] bg-slate-950 px-1 py-0.5 rounded text-slate-500">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 italic p-4 text-center bg-slate-900 rounded">
                                    No active threat pulses found in OTX.
                                </div>
                            )}
                        </section>

                        {/* References */}
                         <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">References</h3>
                            <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                                {cveData?.details?.nvd?.references ? (
                                    cveData.details.nvd.references.map((ref: any, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-cyan-400">
                                            <ExternalLink size={10} className="mt-0.5 shrink-0" />
                                            <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline break-all">
                                                {new URL(ref.url).hostname}
                                            </a>
                                        </li>
                                    ))
                                ) : cveData?.details?.circl?.references ? (
                                     cveData.details.circl.references.map((ref: any, i: number) => {
                                        const url = typeof ref === 'string' ? ref : ref.url;
                                        const label = typeof ref === 'string' ? ref : (ref.name || ref.url);
                                        return (
                                            <li key={i} className="flex items-start gap-2 text-xs text-cyan-400">
                                                <ExternalLink size={10} className="mt-0.5 shrink-0" />
                                                <a href={url} target="_blank" rel="noreferrer" className="hover:underline break-all">
                                                    {label}
                                                </a>
                                            </li>
                                        );
                                     })
                                ) : (
                                    <li className="text-slate-600 text-xs">No references found.</li>
                                )}
                            </ul>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}

function BadgeInfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    )
}
