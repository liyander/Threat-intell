/**
 * Example usage script for the Shodan CVE Scraper API
 * 
 * This script demonstrates how to use the API programmatically
 * Make sure the server is running before executing this script
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

/**
 * Print formatted section header
 */
function printHeader(text) {
    console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Print success message
 */
function printSuccess(text) {
    console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

/**
 * Print error message
 */
function printError(text) {
    console.log(`${colors.red}✗ ${text}${colors.reset}`);
}

/**
 * Example 1: Health Check
 */
async function healthCheck() {
    printHeader('Example 1: Health Check');

    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        printSuccess('API is healthy!');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        printError(`Health check failed: ${error.message}`);
    }
}

/**
 * Example 2: Search for hosts affected by a CVE
 */
async function searchByCVE(cveId = 'CVE-2021-44228') {
    printHeader(`Example 2: Search for ${cveId}`);

    try {
        const response = await axios.get(`${API_BASE_URL}/cve/${cveId}`, {
            params: {
                page: 1,
                limit: 5
            }
        });

        printSuccess(`Found ${response.data.data.summary.total} total hosts`);
        printSuccess(`Returned ${response.data.data.summary.returned} hosts in this page`);

        console.log(`\n${colors.yellow}Sample Hosts:${colors.reset}`);
        response.data.data.hosts.slice(0, 3).forEach((host, index) => {
            console.log(`\n${colors.bright}Host ${index + 1}:${colors.reset}`);
            console.log(`  IP: ${host.ip}`);
            console.log(`  Port: ${host.port}`);
            console.log(`  Organization: ${host.organization}`);
            console.log(`  Location: ${host.location.city}, ${host.location.country}`);
        });
    } catch (error) {
        printError(`CVE search failed: ${error.response?.data?.error || error.message}`);
    }
}

/**
 * Example 3: Get count and statistics
 */
async function getCVECount(cveId = 'CVE-2021-44228') {
    printHeader(`Example 3: Get Statistics for ${cveId}`);

    try {
        const response = await axios.get(`${API_BASE_URL}/cve/${cveId}/count`, {
            params: {
                facets: 'country,org,port'
            }
        });

        printSuccess(`Total affected hosts: ${response.data.data.total}`);

        // Display top countries
        if (response.data.data.facets.country) {
            console.log(`\n${colors.yellow}Top 5 Affected Countries:${colors.reset}`);
            response.data.data.facets.country.slice(0, 5).forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.value}: ${item.count} hosts`);
            });
        }

        // Display top organizations
        if (response.data.data.facets.org) {
            console.log(`\n${colors.yellow}Top 5 Affected Organizations:${colors.reset}`);
            response.data.data.facets.org.slice(0, 5).forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.value}: ${item.count} hosts`);
            });
        }

        // Display top ports
        if (response.data.data.facets.port) {
            console.log(`\n${colors.yellow}Top 5 Affected Ports:${colors.reset}`);
            response.data.data.facets.port.slice(0, 5).forEach((item, index) => {
                console.log(`  ${index + 1}. Port ${item.value}: ${item.count} hosts`);
            });
        }
    } catch (error) {
        printError(`Count request failed: ${error.response?.data?.error || error.message}`);
    }
}

/**
 * Example 4: Get affected components
 */
async function getAffectedComponents(cveId = 'CVE-2021-44228') {
    printHeader(`Example 4: Get Affected Components for ${cveId}`);

    try {
        const response = await axios.get(`${API_BASE_URL}/cve/${cveId}/components`);

        printSuccess(`Found ${response.data.data.total_components} unique components`);

        console.log(`\n${colors.yellow}Top Components:${colors.reset}`);
        response.data.data.components.slice(0, 5).forEach((component, index) => {
            console.log(`\n${colors.bright}Component ${index + 1}:${colors.reset}`);
            console.log(`  Name: ${component.name}`);
            console.log(`  Version: ${component.version}`);
            console.log(`  Vendor: ${component.vendor}`);
            console.log(`  Affected Hosts: ${component.affected_hosts}`);
        });
    } catch (error) {
        printError(`Components request failed: ${error.response?.data?.error || error.message}`);
    }
}

/**
 * Example 5: Search by component
 */
async function searchByComponent(componentName = 'Apache') {
    printHeader(`Example 5: Search for Component "${componentName}"`);

    try {
        const response = await axios.get(`${API_BASE_URL}/component/${encodeURIComponent(componentName)}`, {
            params: {
                page: 1,
                limit: 5
            }
        });

        printSuccess(`Found ${response.data.data.summary.total} total hosts`);

        console.log(`\n${colors.yellow}Sample Services:${colors.reset}`);
        response.data.data.services.slice(0, 3).forEach((service, index) => {
            console.log(`\n${colors.bright}Service ${index + 1}:${colors.reset}`);
            console.log(`  IP: ${service.ip}`);
            console.log(`  Port: ${service.port}`);
            console.log(`  Product: ${service.product}`);
            console.log(`  Version: ${service.version}`);
            if (service.vulns && Object.keys(service.vulns).length > 0) {
                console.log(`  Vulnerabilities: ${Object.keys(service.vulns).join(', ')}`);
            }
        });
    } catch (error) {
        printError(`Component search failed: ${error.response?.data?.error || error.message}`);
    }
}

/**
 * Example 6: Get API info
 */
async function getAPIInfo() {
    printHeader('Example 6: Get Shodan API Info');

    try {
        const response = await axios.get(`${API_BASE_URL}/info`);

        printSuccess('API Information retrieved successfully');
        console.log(`\n${colors.yellow}Your Shodan Account:${colors.reset}`);
        console.log(`  Plan: ${response.data.data.plan || 'N/A'}`);
        console.log(`  Query Credits: ${response.data.data.query_credits || 'N/A'}`);
        console.log(`  Scan Credits: ${response.data.data.scan_credits || 'N/A'}`);
    } catch (error) {
        printError(`API info request failed: ${error.response?.data?.error || error.message}`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log(`${colors.bright}${colors.blue}`);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        Shodan CVE Scraper - Example Usage Script          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);

    console.log(`${colors.yellow}Make sure the server is running on ${API_BASE_URL}${colors.reset}\n`);

    // Run examples
    await healthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    await getAPIInfo();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await searchByCVE('CVE-2021-44228');
    await new Promise(resolve => setTimeout(resolve, 1000));

    await getCVECount('CVE-2021-44228');
    await new Promise(resolve => setTimeout(resolve, 1000));

    await getAffectedComponents('CVE-2021-44228');
    await new Promise(resolve => setTimeout(resolve, 1000));

    await searchByComponent('Apache');

    console.log(`\n${colors.bright}${colors.green}All examples completed!${colors.reset}\n`);
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        printError(`Script failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    healthCheck,
    searchByCVE,
    getCVECount,
    getAffectedComponents,
    searchByComponent,
    getAPIInfo
};
