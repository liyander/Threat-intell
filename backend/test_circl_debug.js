const axios = require('axios');

async function testCircl() {
    try {
        console.log('Fetching https://cve.circl.lu/api/last ...');
        const response = await axios.get('https://cve.circl.lu/api/last', { items: 50 });
        const data = response.data;
        
        console.log(`Received ${data.length} items.`);
        
        let withSummary = 0;
        let withoutSummary = 0;
        
        data.slice(0, 5).forEach(item => {
            console.log('--- Item ---');
            console.log('ID:', item.id);
            console.log('Summary:', item.summary ? item.summary.substring(0, 50) + '...' : 'MISSING');
            console.log('Keys:', Object.keys(item).join(', '));
            if (item.summary) withSummary++; else withoutSummary++;
        });

        console.log(`\nTotal with summary: ${data.filter(i => i.summary).length}`);
        console.log(`Total without summary: ${data.filter(i => !i.summary).length}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testCircl();