require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const cveRoutes = require('./routes/cveRoutes');
const threatRoutes = require('./routes/threatRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Initialize Express app
const app = express();
const PORT = 3001; // Explicitly set to 3001

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/', apiLimiter);

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/cve', cveRoutes);
app.use('/api/threats', threatRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Threat Intelligence & Attack Radar API',
        description: 'Aggregates data from Cloudflare Radar and Level Blue OTX',
        version: '3.1.0',
        endpoints: {
            health: '/api/health',
            // Threat Data
            cve_lookup: '/api/cve/:cveId',
            network_layer: '/api/threats/layer3',
            global_attacks: '/api/threats/global',
            top_sources: '/api/threats/top-sources',
            latest_threats: '/api/threats/pulses',
            indicator_lookup: '/api/threats/indicator/:type/:value'
        },
        documentation: {
            network_layer: 'Detailed L3 DDoS, Protocols, and Attack Vectors',
            global_attacks: 'Get global attack statistics (L3/L7)',
            cve_lookup: 'Get OTX indicators (IPs/Domains) for a CVE',
            latest_threats: 'Get recent OTX threat pulses'
        }
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Threat Intel & Attack Radar API Server`);
    console.log('='.repeat(60));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Integrations: Cloudflare Radar, Level Blue OTX`);
    console.log('='.repeat(60));
    console.log(`\n📚 Documentation: http://localhost:${PORT}/`);
    console.log(`\n💡 New Endpoint (L3 Security):`);
    console.log(`   - http://localhost:${PORT}/api/threats/layer3`);
    console.log(`\n💡 Other endpoints:`);
    console.log(`   - http://localhost:${PORT}/api/cve/CVE-2021-44228`);
    console.log(`   - http://localhost:${PORT}/api/threats/top-sources`);
    console.log('\n');
});

module.exports = app;
