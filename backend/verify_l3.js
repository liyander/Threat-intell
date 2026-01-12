const axios = require('axios');

const TOKEN = 'zOkU-6Sx83buGCEAJ0_z4H3umzt9Jy0LQvnJQqqG';

const client = axios.create({
    baseURL: 'https://api.cloudflare.com/client/v4/radar/attacks/layer3',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    validateStatus: () => true
});

async function verifyL3() {
    console.log('🛡️ Verifying Network Layer (L3) Endpoints...\n');
    const params = { dateRange: '7d', limit: 5, format: 'json' };

    // 1. Attack Summary
    // Shows standard DDoS stats
    console.log('1. L3 Summary (/summary)');
    const r1 = await client.get('/summary', { params });
    log(r1);

    // 2. Attack Timeseries
    // The chart showing attacks over time
    console.log('2. L3 Timeseries (/timeseries)');
    const r2 = await client.get('/timeseries', { params });
    log(r2);

    // 3. Top Protocols
    // UDP, TCP, ICMP, GRE, etc.
    console.log('3. Top Protocols (/top/protocol)');
    const r3 = await client.get('/top/protocol', { params });
    log(r3);

    // 4. Top Industries (Verticals) targeted
    // Banking, Crypto, Gaming, etc.
    console.log('4. Top Industries (/top/industry)');
    const r4 = await client.get('/top/industry', { params });
    log(r4);
}

function log(res) {
    if (res.status === 200) {
        console.log(`   ✅ Success!`);
        console.log(`   Data: ${JSON.stringify(res.data.result).substring(0, 80)}...`);
    } else {
        console.log(`   ❌ Failed (${res.status})`);
        console.log(`   Error: ${JSON.stringify(res.data.errors)}`);
    }
    console.log('');
}

verifyL3();
