const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function verifyEndpoints() {
    console.log('🚀 Verifying Local Server Endpoints...\n');

    const tests = [
        { name: 'Health Check', url: `${BASE_URL}/health` },
        { name: 'Global Threats (Cloudflare)', url: `${BASE_URL}/threats/global` },
        { name: 'Top Sources (Cloudflare)', url: `${BASE_URL}/threats/top-sources` },
        { name: 'CVE Lookup (OTX)', url: `${BASE_URL}/cve/CVE-2021-44228` },
        { name: 'Latest Threats (OTX)', url: `${BASE_URL}/threats/pulses` }
    ];

    for (const test of tests) {
        try {
            const start = Date.now();
            const res = await axios.get(test.url);
            const duration = Date.now() - start;

            if (res.data.success) {
                console.log(`✅ ${test.name}: Working (${duration}ms)`);
                // stringify and show small snippet to prove data exists
                const snippet = JSON.stringify(res.data.data).substring(0, 60);
                console.log(`   Data: ${snippet}...`);
            } else {
                console.log(`❌ ${test.name}: Failed (Logic Error)`);
                console.log(`   Error: ${res.data.error}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Request Failed`);
            console.log(`   Status: ${error.response?.status}`);
            console.log(`   Message: ${error.message}`);
        }
        console.log('');
    }
}

verifyEndpoints();
