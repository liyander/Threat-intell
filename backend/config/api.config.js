require('dotenv').config();

// Use environment variables or fall back to provided keys for immediate usage
const CLOUDFLARE_KEY = process.env.CLOUDFLARE_API_TOKEN || 'zOkU-6Sx83buGCEAJ0_z4H3umzt9Jy0LQvnJQqqG';
const OTX_KEY = process.env.OTX_API_KEY || 'a7224020247d2cbb416e6ca68edb26ab8b510f9d8ccac3ea081032194251ce95';

module.exports = {
    cloudflare: {
        baseUrl: 'https://api.cloudflare.com/client/v4/radar',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_KEY}`,
            'Content-Type': 'application/json'
        }
    },
    otx: {
        baseUrl: 'https://otx.alienvault.com/api/v1',
        headers: {
            'X-OTX-API-KEY': OTX_KEY,
            'Content-Type': 'application/json'
        }
    }
};
