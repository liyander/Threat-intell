const express = require('express');
const router = express.Router();
const otxService = require('../services/otxService');
const cveCirclService = require('../services/cveCirclService');
const nvdService = require('../services/nvdService');

/**
 * @route   GET /api/cve
 * @desc    Get latest CVEs from cve.circl.lu
 */
router.get('/', async (req, res) => {
    try {
        const { query } = req.query;

        // 1. Search Mode
        if (query) {
            // Check if it's a CVE ID
            const isCve = /^CVE-\d{4}-\d{4,}$/i.test(query);
            
            if (isCve) {
                // If it's a specific CVE, fetch details from OTX (or CIRCL)
                const result = await otxService.getCveIndicators(query.toUpperCase());
                
                // transform to array format expected by frontend
                const cves = [{
                    id: result.cve || query,
                    cveId: result.cve || query,
                    description: result.top_pulses?.[0]?.description || result.description || 'Threat Intelligence Found',
                    created: result.timestamp,
                    modified: result.timestamp,
                    cvss: null,
                    tags: result.top_pulses?.[0]?.tags || []
                }];

                return res.json({
                    success: true,
                    source: 'Level Blue OTX',
                    cves
                });
            } else {
                 // General Keyword Search -> Search OTX Pulses
                 // We reuse getCveIndicators as it hits /search/pulses
                 const result = await otxService.getCveIndicators(query);
                 const cves = (result.top_pulses || []).map(p => ({
                     id: p.id,
                     cveId: p.name,
                     description: p.description,
                     created: p.created,
                     tags: p.tags
                 }));

                 return res.json({
                     success: true,
                     source: 'Level Blue OTX',
                     cves
                 });
            }
        }

        // 2. Feed Mode (Latest)
        console.log('Fetching latest CVEs...');
        const cves = await cveCirclService.getLatestCVEs();
        console.log(`Fetched ${cves.length} CVEs.`);
        
        res.json({
            success: true,
            source: 'cve.circl.lu',
            cves: cves 
        });
    } catch (error) {
        console.error('CVE Route Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error: ' + error.message });
    }
});

/**
 * @route   GET /api/cve/:cveId
 * @desc    Get aggregated Threat Intelligence (OTX, CIRCL, NVD)
 * @access  Public
 */
router.get('/:cveId', async (req, res) => {
    try {
        const { cveId } = req.params;
        const normalizedId = cveId.toUpperCase();

        // Validate format (CVE or GHSA)
        const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
        const ghsaPattern = /^GHSA-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/i;

        if (!cvePattern.test(normalizedId) && !ghsaPattern.test(normalizedId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format. Expected CVE-YYYY-NNNN or GHSA-XXXX-XXXX-XXXX'
            });
        }

        const isCve = cvePattern.test(normalizedId);
        
        // Define promises array
        const promises = [
            cveCirclService.getCVE(normalizedId) // Always fetch from Circl
        ];

        // Only fetch from NVD and OTX if it's a standard CVE
        if (isCve) {
            promises.push(otxService.getCveIndicators(normalizedId));
            promises.push(nvdService.getCVE(normalizedId));
        }

        // Fetch parallel
        const results = await Promise.allSettled(promises);

        // Map results based on what was requested
        // results[0] is always Circl
        const circlResult = results[0]; 
        const otxResult = isCve ? results[1] : { status: 'rejected' };
        const nvdResult = isCve ? results[2] : { status: 'rejected' };

        const aggregatedData = {
            id: normalizedId,
            // Primary data from NVD if available, else CIRCL (summary OR details for GHSA), else OTX
            summary: nvdResult.value?.description || circlResult.value?.summary || circlResult.value?.details || otxResult.value?.description,
            published: nvdResult.value?.published || circlResult.value?.Published || circlResult.value?.published || otxResult.value?.timestamp,
            cvss: nvdResult.value?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || circlResult.value?.cvss,
            
            // Detailed Source Data
            details: {
                otx: otxResult.status === 'fulfilled' ? otxResult.value : null,
                circl: circlResult.status === 'fulfilled' ? circlResult.value : null,
                nvd: nvdResult.status === 'fulfilled' ? nvdResult.value : null
            }
        };

        res.json({
            success: true,
            data: aggregatedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
