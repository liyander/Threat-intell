const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Threat & Attack Analysis API',
        integrations: ['Cloudflare Radar', 'Level Blue OTX']
    });
});

module.exports = router;
