const axios = require('axios');

const CLOUDFLARE_KEY = 'zOkU-6Sx83buGCEAJ0_z4H3umzt9Jy0LQvnJQqqG';
const OTX_KEY = 'a7224020247d2cbb416e6ca68edb26ab8b510f9d8ccac3ea081032194251ce95';

const cfConfig = {
    headers: {
        'Authorization': `Bearer ${CLOUDFLARE_KEY}`,
        'Content-Type': 'application/json'
    }
};

const otxConfig = {
    headers: {
        'X-OTX-API-KEY': OTX_KEY,
        'Content-Type': 'application/json'
    }
};

async function testCloudflare() {
    console.log('\n🔵 --- TESTING CLOUDFLARE RADAR ---');

    // Test 1: Verify Token / User Identity
    console.log('1. Testing Token Validity (User Verify)...');
    try {
        const res = await axios.get('https://api.cloudflare.com/client/v4/user/tokens/verify', cfConfig);
        console.log('   ✅ Token Valid. Status:', res.data.result.status);
    } catch (e) {
        console.log('   ❌ Token Verify Failed:', e.response?.data?.errors || e.message);
    }

    // Test 2: Radar Attacks Summary (L7)
    console.log('\n2. Testing Radar L7 Summary...');
    try {
        const res = await axios.get('https://api.cloudflare.com/client/v4/radar/attacks/layer7/summary', {
            ...cfConfig,
            params: { dateRange: '7d' }
        });
        console.log('   ✅ L7 Summary Success!');
    } catch (e) {
        console.log('   ❌ L7 Summary Failed:', JSON.stringify(e.response?.data?.errors, null, 2) || e.message);
    }

    // Test 3: Radar Net Flows (Alternative Endpoint)
    console.log('\n3. Testing Radar Net Flows (Global)...');
    try {
        const res = await axios.get('https://api.cloudflare.com/client/v4/radar/net/flows/summary', {
            ...cfConfig,
            params: { dateRange: '7d' }
        });
        console.log('   ✅ Net Flows Success!');
    } catch (e) {
        console.log('   ❌ Net Flows Failed:', JSON.stringify(e.response?.data?.errors, null, 2) || e.message);
    }
}

async function testOTX() {
    console.log('\n🟢 --- TESTING LEVEL BLUE OTX ---');

    // Test 1: User Me
    console.log('1. Testing specific User/Me...');
    try {
        const res = await axios.get('https://otx.alienvault.com/api/v1/users/me', otxConfig);
        console.log('   ✅ Auth Success! User:', res.data.username);
    } catch (e) {
        console.log('   ❌ Auth Failed:', e.response?.data || e.message);
    }

    // Test 2: Search Pulses (CVE)
    console.log('\n2. Testing Pulse Search (CVE-2021-44228)...');
    try {
        const res = await axios.get('https://otx.alienvault.com/api/v1/search/pulses', {
            params: { q: 'CVE-2021-44228' },
            ...otxConfig
        });
        console.log('   ✅ Search Success! Count:', res.data.count);
    } catch (e) {
        console.log('   ❌ Search Failed:', e.response?.data || e.message);
    }

    // Test 3: Indicator Details
    console.log('\n3. Testing Indicator Details (8.8.8.8)...');
    try {
        const res = await axios.get('https://otx.alienvault.com/api/v1/indicators/IPv4/8.8.8.8/general', otxConfig);
        console.log('   ✅ Indicator Success! ID:', res.data.indicator);
    } catch (e) {
        console.log('   ❌ Indicator Failed:', e.response?.data || e.message);
    }
}

(async () => {
    await testCloudflare();
    await testOTX();
})();
