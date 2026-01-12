const express = require('express');
const router = express.Router();
const cloudflareService = require('../services/cloudflareService');
const otxService = require('../services/otxService');
const malwareService = require('../services/malwareBazaarService');

/**
 * @route   GET /api/threats/malware
 * @desc    Get recent malware detections from MalwareBazaar
 */
router.get('/malware', async (req, res) => {
    try {
        const data = await malwareService.getRecentMalware();
        res.json({
            success: true,
            source: 'MalwareBazaar',
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error in malware route:', error);
        res.status(500).json({ success: false, error: error.message, data: [] });
    }
});

/**
 * @route   GET /api/threats/malware/:hash
 * @desc    Get detailed info for specific malware hash
 */
router.get('/malware/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const data = await malwareService.getMalwareDetails(hash);
        if (data) {
            res.json({
                success: true,
                source: 'MalwareBazaar',
                data: data
            });
        } else {
             res.status(404).json({ success: false, error: 'Malware sample not found' });
        }
    } catch (error) {
        console.error('Error in malware details route:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/threats/layer3
 * @desc    Get detailed Network Layer (L3) Security Dashboard
 *          Matches User Images: Volume, Sources, Vectors, Flows, TCP Stats
 */
router.get('/layer3', async (req, res) => {
    try {
        const dashboard = await cloudflareService.getDetailedDashboard();
        res.json({
            success: true,
            source: 'Cloudflare Radar',
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/threats/global
 * @desc    Get global attack statistics summary
 */
router.get('/global', async (req, res) => {
    try {
        // Use detailed dashboard for global view as well
        const dashboard = await cloudflareService.getDetailedDashboard();
        res.json({
            success: true,
            source: 'Cloudflare Radar',
            data: dashboard.volume_change
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/threats/top-sources
 * @desc    Get top attack source countries
 */
router.get('/top-sources', async (req, res) => {
    try {
        const sources = await cloudflareService.getAttacksByCountry();
        res.json({
            success: true,
            source: 'Cloudflare Radar',
            data: sources
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/threats/pulses
 * @desc    Get latest threat pulses from OTX
 */
router.get('/pulses', async (req, res) => {
    try {
        const pulses = await otxService.getGeneralThreats();
        res.json({
            success: true,
            source: 'Level Blue OTX',
            data: pulses
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/threats/indicator/:type/:value
 * @desc    Lookup a specific IP or Domain in OTX
 */
router.get('/indicator/:type/:value', async (req, res) => {
    try {
        const { type, value } = req.params;
        // Basic validation
        if (!['IPv4', 'domain', 'hostname'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type. Use IPv4, domain, or hostname' });
        }

        const details = await otxService.getIndicatorDetails(value, type);
        res.json({
            success: true,
            source: 'Level Blue OTX',
            data: details
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
