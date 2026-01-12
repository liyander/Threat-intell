const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class NvdService {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
            timeout: 10000
        });
    }

    async getCVE(cveId) {
        try {
            const cacheKey = `nvd_${cveId}`;
            if (cache.get(cacheKey)) return cache.get(cacheKey);

            const response = await this.client.get('', {
                params: { cveId }
            });

            const vulns = response.data.vulnerabilities || [];
            if (vulns.length === 0) return null;

            const cveData = vulns[0].cve;
            
            const result = {
                source: 'NIST NVD',
                id: cveData.id,
                description: cveData.descriptions?.find(d => d.lang === 'en')?.value,
                published: cveData.published,
                lastModified: cveData.lastModified,
                metrics: cveData.metrics,
                weaknesses: cveData.weaknesses,
                configurations: cveData.configurations,
                references: cveData.references
            };

            cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('NVD API Error:', error.message);
            // NVD often rate limits or times out, return null gracefully
            return null;
        }
    }
}

module.exports = new NvdService();
