# 🛡️ Threat Intel & Attack Radar API

This API aggregates real-time attack data and threat intelligence from **Cloudflare Radar** and **Level Blue OTX**.

## ✨ Features
- 🌍 **Global Attack Stats**: View L3 and L7 attack trends (Cloudflare).
- 📍 **Top Attack Sources**: See which countries are generating the most attacks.
- 🦠 **CVE Intelligence**: Lookup a CVE to find related IPs, domains, and file hashes (OTX).
- 🚨 **Latest Threats**: Get the latest threat pulses and campaigns.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Server**
    ```bash
    npm run dev
    ```

3.  **Test Endpoints**

    **Global Attacks:**
    ```bash
    curl http://localhost:3000/api/threats/global
    ```

    **CVE Lookup (e.g., Log4Shell):**
    ```bash
    curl http://localhost:3000/api/cve/CVE-2021-44228
    ```

    **Top Attack Source Countries:**
    ```bash
    curl http://localhost:3000/api/threats/top-sources
    ```

    **Specific IP Lookup:**
    ```bash
    curl http://localhost:3000/api/threats/indicator/IPv4/8.8.8.8
    ```

## ⚙️ Configuration
The API keys are pre-configured in `config/api.config.js` or `.env`.

- **Cloudflare Token**: `zOkU...`
- **OTX Key**: `a722...`

## 📚 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/threats/global` | Global attack summaries |
| GET | `/api/threats/top-sources` | Countries attacking the most |
| GET | `/api/threats/pulses` | Recent threat pulses |
| GET | `/api/cve/:cveId` | Indicators for a CVE |
| GET | `/api/threats/indicator/:type/:value` | Lookup IP/Domain details |
