const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

class CveCirclService {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://cve.circl.lu/api',
            headers: {
                'User-Agent': 'MapIntel-Backend/1.0'
            }
        });
    }

    /**
     * Get latest published CVEs
     */
    async getLatestCVEs(limit = 100) {
        try {
            const cacheKey = 'cve_circl_last';
            if (cache.get(cacheKey)) return cache.get(cacheKey);

            const response = await this.client.get('/last');
            
            // Deduplicate by ID
            const uniqueMap = new Map();
            (response.data || []).forEach(item => {
                // Normalize ID
                const id = item.id || item.cveMetadata?.cveId;
                if (id && !uniqueMap.has(id)) {
                    uniqueMap.set(id, item);
                }
            });

            const data = Array.from(uniqueMap.values()).slice(0, limit);

            const mapped = data.map((item, index) => {
                try {
                    const id = item.id || item.cveMetadata?.cveId || `unknown-${index}-${Date.now()}`;
                    
                    // Helper to extract description from various schemas
                    let description = item.summary; // Legacy
                    if (!description && item.details) description = item.details; // GHSA
                    if (!description && item.containers?.cna?.descriptions) {
                        // JSON 5.0
                        const descObj = (item.containers.cna.descriptions || []).find(d => d.lang === 'en' || d.lang === 'en-US') || item.containers.cna.descriptions[0];
                        if (descObj) description = descObj.value;
                    }
                    if (!description) description = "No description available";

                    // Helper for time
                    const created = item.Published || item.published || item.cveMetadata?.datePublished || new Date().toISOString();
                    const modified = item.Modified || item.modified || item.cveMetadata?.dateUpdated;

                    // Helper for tags (product / affected)
                    let tags = [];
                    if (Array.isArray(item.vulnerable_product)) {
                        tags = item.vulnerable_product.map(p => (typeof p === 'string' ? p.split(':')[4] || p : String(p)));
                    } else if (Array.isArray(item.affected)) {
                        // GHSA affected array
                        tags = item.affected.map(a => a.package?.name).filter(Boolean);
                    }

                    return {
                        id: id,
                        name: id,
                        description: description,
                        created: created,
                        modified: modified,
                        cvss: item.cvss || item.severity, // GHSA often has string severity 'HIGH' etc
                        references: item.references || [],
                        tags: [
                            item.cvss ? `CVSS ${item.cvss}` : null,
                            ...tags
                        ].filter(Boolean).slice(0, 4)
                    };
                } catch (err) {
                    console.error('Error mapping item:', item.id, err.message);
                    return null;
                }
            }).filter(Boolean); // Remove nulls from failed mappings

            cache.set(cacheKey, mapped);
            return mapped;
        } catch (error) {
            console.error('CVE Circl Error:', error.message);
            return [];
        }
    }

    /**
     * Get specific CVE details
     */
    async getCVE(cveId) {
        try {
            const response = await this.client.get(`/cve/${cveId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new CveCirclService();
