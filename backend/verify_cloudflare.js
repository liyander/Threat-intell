const axios = require('axios');

const TOKEN = 'zOkU-6Sx83buGCEAJ0_z4H3umzt9Jy0LQvnJQqqG';

const client = axios.create({
    baseURL: 'https://api.cloudflare.com/client/v4/radar',
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true // Don't throw on error
});

async function verify() {
    console.log('🔍 Starting Strict Cloudflare Radar Verification...\n');

    // Test 1: Net Flows Summary (Usually reliable)
    // Docs: GET /radar/net/flows/summary
    console.log('1️⃣ Testing Net Flows Summary...');
    const r1 = await client.get('/net/flows/summary', {
        params: { dateRange: '7d', format: 'json' }
    });
    printResult(r1);

    // Test 2: HTTP Summary
    // Docs: GET /radar/http/summary
    console.log('\n2️⃣ Testing HTTP Summary...');
    const r2 = await client.get('/http/summary', {
        params: { dateRange: '7d' }
    });
    printResult(r2);

    // Test 3: Attacks L7 Summary
    // Docs: GET /radar/attacks/layer7/summary
    console.log('\n3️⃣ Testing Attacks L7 Summary...');
    const r3 = await client.get('/attacks/layer7/summary', {
        params: { dateRange: '7d' } // dates are required
    });
    printResult(r3);

    // Test 4: Top Locations
    // Docs: GET /radar/http/top/locations
    console.log('\n4️⃣ Testing Top Source Locations...');
    const r4 = await client.get('/http/top/locations', {
        params: { dateRange: '7d', limit: 5 }
    });
    printResult(r4);
}

function printResult(res) {
    if (res.status === 200) {
        console.log(`   ✅ Success! (${res.status})`);
        // Print a snippet of data to confirm it's real
        const dataStr = JSON.stringify(res.data.result || res.data).substring(0, 100);
        console.log(`   📄 Data: ${dataStr}...`);
    } else {
        console.log(`   ❌ Failed (${res.status})`);
        if (res.data && res.data.errors) {
            res.data.errors.forEach(e => console.log(`      Error: ${e.message}`));
        } else {
            console.log(`      Body: ${JSON.stringify(res.data)}`);
        }
    }
}

verify();
