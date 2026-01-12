
export interface Attack {
  id: string;
  source: string;
  target: string;
  sourceCountry: string;
  targetCountry: string;
  sourceCountryCode: string; // Added for robust matching
  targetCountryCode: string; // Added for robust matching
  type: string;
  timestamp: Date;
  sourceCoords: [number, number];
  targetCoords: [number, number];
}

export interface CVE {
  id: string;
  cveId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  score?: number | null;
  description: string;
  published: string;
  rawDate?: string | null;
  affectedSystems: string[];
  isExploited?: boolean;
}

export interface CountryStat {
  country: string;
  percentage: number;
  code: string;
}

export const ATTACK_TYPES = ['UDP Flood', 'TCP Flood', 'SQL Injection', 'XSS', 'Malware', 'Port Scan'];
export const COUNTRIES = [
  { name: 'United States', code: 'US', coords: [-95.7129, 37.0902] },
  { name: 'China', code: 'CN', coords: [104.1954, 35.8617] },
  { name: 'Russia', code: 'RU', coords: [105.3188, 61.5240] },
  { name: 'Brazil', code: 'BR', coords: [-51.9253, -14.2350] },
  { name: 'Germany', code: 'DE', coords: [10.4515, 51.1657] },
  { name: 'United Kingdom', code: 'GB', coords: [-3.4359, 55.3781] },
  { name: 'India', code: 'IN', coords: [78.9629, 20.5937] },
  { name: 'Japan', code: 'JP', coords: [138.2529, 36.2048] },
  { name: 'France', code: 'FR', coords: [2.2137, 46.2276] },
  { name: 'Indonesia', code: 'ID', coords: [113.9213, -0.7893] },
  { name: 'Vietnam', code: 'VN', coords: [108.2772, 14.0583] },
  { name: 'Netherlands', code: 'NL', coords: [5.2913, 52.1326] },
  { name: 'Singapore', code: 'SG', coords: [103.8198, 1.3521] },
  { name: 'Canada', code: 'CA', coords: [-106.3468, 56.1304] },
  { name: 'Australia', code: 'AU', coords: [133.7751, -25.2744] },
  { name: 'South Korea', code: 'KR', coords: [127.7669, 35.9078] },
  { name: 'Taiwan', code: 'TW', coords: [120.9605, 23.6978] },
  { name: 'Iran', code: 'IR', coords: [53.6880, 32.4279] },
  { name: 'North Korea', code: 'KP', coords: [127.5101, 40.3399] }
];

export const generateMockAttack = (): Attack => {
  const source = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  let target = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  while (target.name === source.name) {
    target = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    source: source.name,
    target: target.name,
    sourceCountry: source.code,
    targetCountry: target.code,    sourceCountryCode: source.code,
    targetCountryCode: target.code,    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    timestamp: new Date(),
    sourceCoords: source.coords as [number, number],
    targetCoords: target.coords as [number, number],
  };
};

export const MOCK_STATS: { attackers: CountryStat[]; attacked: CountryStat[]; vectors: { name: string; percentage: number }[] } = {
  attackers: [
    { country: 'United States', percentage: 62, code: 'US' },
    { country: 'Brazil', percentage: 26, code: 'BR' },
    { country: 'Turkey', percentage: 9, code: 'TR' },
    { country: 'United Kingdom', percentage: 2, code: 'GB' },
    { country: 'Bulgaria', percentage: 1, code: 'BG' },
  ],
  attacked: [
    { country: 'United States', percentage: 45, code: 'US' },
    { country: 'Japan', percentage: 14, code: 'JP' },
    { country: 'Canada', percentage: 14, code: 'CA' },
    { country: 'Australia', percentage: 14, code: 'AU' },
    { country: 'India', percentage: 13, code: 'IN' },
  ],
  vectors: [
    { name: 'UDP Flood', percentage: 90 },
    { name: 'Low and Slow Attack', percentage: 5 },
    { name: 'TCP Flood', percentage: 3 },
    { name: 'ICMP Flood', percentage: 1 },
    { name: 'DNS Flood', percentage: 1 },
  ]
};

export const MOCK_CVES: CVE[] = [
  {
    id: '1',
    cveId: 'CVE-2026-10234',
    severity: 'CRITICAL',
    description: 'Remote Code Execution in OpenSSH service via heap buffer overflow.',
    published: '2 mins ago',
    affectedSystems: ['Linux Servers', 'IoT Devices']
  },
  {
    id: '2',
    cveId: 'CVE-2026-0988',
    severity: 'HIGH',
    description: 'SQL Injection vulnerability in popular e-commerce plugin.',
    published: '15 mins ago',
    affectedSystems: ['Web Servers', 'Database Clusters']
  },
  {
    id: '3',
    cveId: 'CVE-2026-1102',
    severity: 'MEDIUM',
    description: 'Cross-Site Scripting (XSS) in admin dashboard.',
    published: '1 hour ago',
    affectedSystems: ['CMS Platforms']
  }
];
