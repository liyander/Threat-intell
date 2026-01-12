const axios = require('axios');
const config = require('../config/api.config');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 });

class OtxService {
    constructor() {
        this.client = axios.create({
            baseURL: config.otx.baseUrl,
            headers: config.otx.headers
        });
    }

    async getGeneralThreats(limit = 10) {
        try {
            const response = await this.client.get('/pulses/subscribed', {
                params: { limit, page: 1 }
            });
            return response.data;
        } catch (error) {
            console.error('OTX General Threat Error:', error.message);
            return { results: [], count: 0, error: 'Failed to fetch threats' };
        }
    }

    async getCveIndicators(cveId) {
        try {
            const cacheKey = `otx_cve_${cveId}`;
            if (cache.get(cacheKey)) return cache.get(cacheKey);

            const response = await this.client.get('/search/pulses', {
                params: { q: cveId, sort: '-modified' }
            });

            const pulses = response.data.results || [];
            const pulseDetails = pulses.slice(0, 5).map(p => ({
                name: p.name,
                description: p.description,
                author_name: p.author_name,
                created: p.created,
                tags: p.tags,
                references: p.references,
                id: p.id
            }));

            const result = {
                cve: cveId,
                pulse_count: response.data.count || 0,
                top_pulses: pulseDetails,
                timestamp: new Date().toISOString()
            };

            cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('OTX CVE Error:', error.message);
            return {
                cve: cveId,
                error: 'Failed to find CVE data',
                details: error.message
            };
        }
    }

    async getIndicatorDetails(indicator, type = 'IPv4') {
        try {
            const response = await this.client.get(`/indicators/${type}/${indicator}/general`);
            return response.data;
        } catch (error) {
            return { error: 'Indicator not found or invalid type', details: error.message };
        }
    }
}

module.exports = new OtxService();
