// CVE Parsing and Formatting Utilities

export interface CVEItem {
    id: string;
    summary: string;
    date: string | null;
    score: number | null;
    isExploited?: boolean;
    raw?: any;
}

export function timeAgo(dateString: string | null | undefined): string {
    if (!dateString) return 'Date Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date Unknown';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

export function truncate(str: string, n: number): string {
    if (!str) return '';
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
}

export function getCvssScore(cve: any): number | null {
    const checkMetrics = (metrics: any[]) => {
        if (!metrics) return null;
        for (const m of metrics) {
            if (m.cvssV3_1) return m.cvssV3_1.baseScore;
            if (m.cvssV3_0) return m.cvssV3_0.baseScore;
            if (m.cvssV4_0) return m.cvssV4_0.baseScore;
            if (m.cvssV2_0) return m.cvssV2_0.baseScore;
            if (m.cvssV3_1?.baseScore) return m.cvssV3_1.baseScore; 
        }
        return null;
    };

    // 0. Legacy flat format (backend/circl usually provides this directly)
    if (typeof cve.cvss === 'number') return cve.cvss;
    if (typeof cve.cvss === 'string' && !isNaN(parseFloat(cve.cvss))) return parseFloat(cve.cvss);

    // 1. Check CNA (Primary Source)
    let score = checkMetrics(cve.containers?.cna?.metrics);
    if (score) return score;

    // 2. Check ADP (Additional Data Providers)
    if (cve.containers?.adp) {
        for (const adp of cve.containers.adp) {
            score = checkMetrics(adp.metrics);
            if (score) return score;
        }
    }

    return null;
}

export function parseCVEData(cve: any): CVEItem {
    // ID
    let id = cve.id || cve.cveMetadata?.cveId || 'Unknown ID';

    // Description
    let summary = cve.summary || cve.description; // Legacy flat

    // Try CNA Description
    if (!summary && cve.containers?.cna?.descriptions) {
        const descObj = cve.containers.cna.descriptions.find((d: any) => d.lang === 'en' || d.lang === 'en-US') || cve.containers.cna.descriptions[0];
        if (descObj) summary = descObj.value;
    }
    // Try CNA Title as fallback
    if (!summary && cve.containers?.cna?.title) {
        summary = cve.containers.cna.title;
    }
    // Try ADP Description
    if (!summary && cve.containers?.adp) {
        for (const adp of cve.containers.adp) {
            if (adp.descriptions) {
                const descObj = adp.descriptions.find((d: any) => d.lang === 'en') || adp.descriptions[0];
                if (descObj) { summary = descObj.value; break; }
            }
        }
    }
    if (!summary) summary = "No description available";

    // Date
    let date = cve.Modified || cve.Published || cve.created;
    if (cve.cveMetadata?.dateUpdated) date = cve.cveMetadata.dateUpdated;
    else if (cve.cveMetadata?.datePublished) date = cve.cveMetadata.datePublished;

    // Safety check for date
    // (kept as string for logic, validated in timeAgo)

    // Score
    let score = getCvssScore(cve);

    return { 
        id, 
        summary, 
        date: date || null, 
        score,
        isExploited: cve.isExploited || false, // Preserve existing flag if present
        raw: cve
    };
}

export function getSeverityStyle(score: number | null) {
    if (score === null || score === undefined) return { label: 'UNKNOWN', color: 'text-gray-500', bg: 'bg-gray-900/50', border: 'border-gray-700' };
    if (score >= 9.0) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-950/30', border: 'border-red-900' };
    if (score >= 7.0) return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-950/30', border: 'border-orange-900' };
    if (score >= 4.0) return { label: 'MEDIUM', color: 'text-yellow-500', bg: 'bg-yellow-950/30', border: 'border-yellow-900' };
    return { label: 'LOW', color: 'text-green-500', bg: 'bg-green-950/30', border: 'border-green-900' };
}
