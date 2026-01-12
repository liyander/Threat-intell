const axios = require('axios');

const TOKEN = 'zOkU-6Sx83buGCEAJ0_z4H3umzt9Jy0LQvnJQqqG';

const client = axios.create({
    baseURL: 'https://api.cloudflare.com/client/v4/radar',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    validateStatus: () => true
});

async function verifyImageFeatures() {
    console.log('📸 Verifying Data for Requested Images...\n');
    const params = { dateRange: '7d', format: 'json' };

    // Image 1: Attack Volume Change & TCP/UDP Split
    console.log('1. Attack Volume (TCP/UDP Split)...');
    // Likely: /attacks/layer3/summary (Protocol breakdown inside)
    const r1 = await client.get('/attacks/layer3/summary', { params });
    log(r1, 'Attack Volume');

    // Image 1 (Right): Top Sources
    console.log('2. Top Sources (Network Layer)...');
    // Likely: /attacks/layer3/top/locations/source
    const r2 = await client.get('/attacks/layer3/top/locations/source', { params: { ...params, limit: 10 } });
    log(r2, 'Top Sources');

    // Image 2: Attack Distribution by Protocol
    console.log('3. Attack Distribution (Protocol)...');
    // Likely: /attacks/layer3/timeseries_groups/protocol
    const r3 = await client.get('/attacks/layer3/timeseries_groups/protocol', { params });
    log(r3, 'Protocol Timeseries');

    // Image 2 (Bottom): Vectors (UDP Flood, SYN Flood...)
    console.log('4. Attack Vectors...');
    // Likely: /attacks/layer3/top/vector
    const r4 = await client.get('/attacks/layer3/top/vector', { params });
    log(r4, 'Attack Vectors');

    // Image 3: Source -> Target Flow
    console.log('5. Source -> Target Flow...');
    // Likely: /attacks/layer3/top/locations/target (combined with source gives flows)
    const r5 = await client.get('/attacks/layer3/top/locations/target', { params });
    log(r5, 'Target Locations');

    // Image 4: TCP Resets/Timeouts
    console.log('6. TCP Resets/Timeouts...');
    // Likely: /tcp/resets_timeouts/summary or similar
    const r6 = await client.get('/tcp/resets_timeouts/summary', { params }); // Trial guessing
    // Alternative guess if above fails: /quality/tcp/summary
    const r6b = await client.get('/quality/tcp/summary', { params });

    log(r6, 'TCP Resets (Try 1)');
    if (r6.status !== 200) log(r6b, 'TCP Resets (Try 2 - Quality)');
}

function log(res, label) {
    if (res.status === 200) {
        console.log(`   ✅ ${label}: Success!`);
    } else {
        console.log(`   ❌ ${label}: Failed (${res.status})`);
        // console.log(`      ${JSON.stringify(res.data.errors)}`);
    }
}

verifyImageFeatures();
