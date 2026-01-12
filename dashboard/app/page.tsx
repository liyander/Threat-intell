'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StatsPanel from '@/components/StatsPanel';
import CVEFeed from '@/components/CVEFeed';
import MalwareInsights from '@/components/MalwareInsights';
import SearchBar from '@/components/SearchBar';
import { generateMockAttack, MOCK_STATS, MOCK_CVES, Attack, CVE, CountryStat, COUNTRIES } from '@/lib/mockData';
import { Activity, Globe, Shield, Zap, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { getLayer3Dashboard, getLatestThreats, getLatestCVEs } from '@/lib/api';
import { parseCVEData, getSeverityStyle } from '@/lib/cveUtils';

import AttackGraph from '@/components/AttackGraph';

const ThreatMap = dynamic(() => import('@/components/ThreatMap'), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [cves, setCves] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real data state
  const [stats, setStats] = useState(MOCK_STATS);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Initial Fetch: Real Data from Backend
  useEffect(() => {
    const fetchData = async () => {
        // 1. Fetch Dashboard Stats
        try {
            const dashData = await getLayer3Dashboard();
            if (dashData && dashData.top_sources) { 
                setDashboardData(dashData);
                
                // Map backend data to frontend Stats
                const newStats = {
                    attackers: dashData.top_sources.map((s: any) => ({
                        country: s.name,
                        percentage: parseFloat((s.percent || '0').replace('%', '')),
                        code: s.code
                    })).slice(0, 5),
                    attacked: [ // Backend data doesn't explicitly list top targets ranking, infer or keep static/mock
                        { country: 'United States', percentage: 45, code: 'US' },
                        { country: 'China', percentage: 15, code: 'CN' },
                        { country: 'Germany', percentage: 10, code: 'DE' },
                        { country: 'Brazil', percentage: 8, code: 'BR' },
                        { country: 'India', percentage: 7, code: 'IN' }
                    ],
                    vectors: dashData.attack_vectors ? dashData.attack_vectors.map((v: any) => ({
                        name: v.name,
                        percentage: v.value 
                    })).slice(0, 5) : stats.vectors
                };
                setStats(newStats);
            }
        } catch (e) {
            console.error("Dashboard data fetch error", e);
        }

        // 2. Fetch Latest CVEs from Backend (cve.circl.lu)
        try {
             const cvesData = await getLatestCVEs();
             if (cvesData && Array.isArray(cvesData)) {
                 const mappedCves: CVE[] = cvesData
                    .map((t: any) => {
                        // Ensure we respect the backend 'description' if parseCVEData fails to find one
                        const parsed = parseCVEData(t);
                        const severityStyle = getSeverityStyle(parsed.score);
                        
                        return {
                            id: parsed.id,
                            cveId: parsed.id,
                            severity: severityStyle.label as any,
                            score: parsed.score,
                            description: parsed.summary && parsed.summary !== 'No description available' ? parsed.summary : (t.description || "No description available"),
                            published: parsed.date ? new Date(parsed.date).toLocaleDateString() : 'Unknown',
                            rawDate: parsed.date, // Pass raw date for timeAgo
                            affectedSystems: t.tags || [],
                            isExploited: false // Default
                        };
                    })
                    // Filter out items with no description or rejected
                    .filter((c: any) => c.description && c.description !== "No description available" && !c.description.startsWith("** REJECT **"))
                    // Sort by score (Highest first) as per reference logic
                    .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                    // Limit to 30 for display
                    .slice(0, 30);
                    
                 setCves(mappedCves);
            }
        } catch (e) {
            console.error("CVE fetch error", e);
        } finally {
            // Artificial delay for smooth UX if data loads too fast
            setTimeout(() => setLoading(false), 800);
        }
    };

    fetchData();
    // Poll every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate incoming attacks (Strictly Driven by Backend Data)
  useEffect(() => {
    // Determine active data source
    const hasBackendFlows = dashboardData && dashboardData.flow_map && dashboardData.flow_map.flows && dashboardData.flow_map.flows.length > 0;

    if (!hasBackendFlows) {
        return;
    }

    const interval = setInterval(() => {
      // Generate multiple attacks per tick for higher density
      const batchSize = Math.floor(Math.random() * 8) + 4; 
      
      const newAttacks = Array.from({ length: batchSize }).map(() => {
           let base = generateMockAttack(); // Initial skeleton

           // Global Mode: Strictly follow Backend Flow Map
           const flow = dashboardData.flow_map.flows[Math.floor(Math.random() * dashboardData.flow_map.flows.length)];
           
           const srcCountry = COUNTRIES.find(c => c.code === flow.source);
           const tgtCountry = COUNTRIES.find(c => c.code === flow.target);

           if (srcCountry && tgtCountry) {
               return {
                   ...base,
                   source: srcCountry.name,
                   sourceCountry: srcCountry.code,
                   sourceCountryCode: srcCountry.code,
                   sourceCoords: srcCountry.coords as [number, number],
                   target: tgtCountry.name,
                   targetCountry: tgtCountry.code,
                   targetCountryCode: tgtCountry.code,
                   targetCoords: tgtCountry.coords as [number, number],
               };
           }
           
           return base;
      });
      
      setAttacks(prev => {
        const updated = [...prev, ...newAttacks];
        // Keep strictly the last 80 for performance but high density
        if (updated.length > 80) return updated.slice(updated.length - 80);
        return updated;
      });
    }, 600); // Faster interval
    return () => clearInterval(interval);
  }, [dashboardData]);

  const handleSearch = useCallback((query: string) => {
    const isCveSearch = query.toUpperCase().startsWith('CVE-') || query.toUpperCase().startsWith('GHSA-');
    if (isCveSearch) {
        router.push(`/cve/${query.toUpperCase()}`);
    } else {
        // Fallback or Alert for now as Shodan/Search page is removed
        console.log("General search not available yet:", query);
    }
  }, [router]);

  if (loading) {
    return (
        <div className="flex flex-col h-screen w-full bg-[#020617] text-gray-200 items-center justify-center relative overflow-hidden">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="z-10 flex flex-col items-center gap-8">
                {/* Logo Animation */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 animate-[spin_3s_linear_infinite]"></div>
                    <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-r-cyan-500 border-t-transparent border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="text-cyan-400 animate-pulse" size={48} />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase font-mono">
                        Initializing Helios
                    </h2>
                    <div className="flex items-center gap-2 text-cyan-500/80 font-mono text-sm">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                        Connecting to Global Sensor Network...
                    </div>
                </div>

                {/* Status Items */}
                <div className="flex gap-4 text-xs font-mono text-slate-500 mt-4">
                    <span className="flex items-center gap-1">
                        <Shield size={12} className={dashboardData ? "text-green-500" : "text-slate-600"} /> 
                        L3 Feed
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1">
                        <Zap size={12} className={cves.length > 0 ? "text-green-500" : "text-slate-600"} /> 
                        CVE Data
                    </span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-gray-200">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#050B14]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Globe className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Helios</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Live Global Monitor
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 relative">
            <SearchBar onSearch={handleSearch} isLoading={false} />
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-red-900/30 text-red-500 border border-red-900/50 px-4 py-1.5 rounded text-xs font-bold animate-pulse flex items-center gap-2">
            <Activity size={14} /> LIVE ATTACK STREAM
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden relative grid grid-cols-1 md:grid-cols-4 gap-0">
          
          {/* Left Panel: Stats */}
          <div className="hidden md:block col-span-1 border-r border-gray-800 bg-[#050B14]/80 backdrop-blur z-10 h-full overflow-y-auto">
              <StatsPanel stats={stats} />
              <MalwareInsights />
          </div>

          {/* Center Panel: Map */}
          <div className="col-span-1 md:col-span-2 relative h-full bg-[#020617]">
               <div className="absolute inset-0 z-0">
                    <ThreatMap attacks={attacks} />
               </div>
          </div>

          {/* Right Panel: CVE Feed */}
          <div className="hidden md:block col-span-1 border-l border-gray-800 bg-[#050B14]/80 backdrop-blur z-10 h-full overflow-hidden relative">
              <div className="absolute inset-0 p-4">
                  <CVEFeed cves={cves} onSearch={handleSearch} />
              </div>
          </div>
      </div>
    </div>
  );
}
