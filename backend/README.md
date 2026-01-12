# �️ Threat Intelligence & Attack Radar API

A powerful backend service that aggregates real-time cyber security data from **Cloudflare Radar** and **Level Blue OTX** (formerly AlienVault) to provide a comprehensive view of global threats, DDoS attacks, and vulnerability intelligence.

## ✨ Key Features

### 1. 🌐 Network Layer Security Dashboard (Layer 3/4)
A complete security dashboard specifically designed to visualize network attacks.
- **Attack Volume Trends**: Real-time traffic and attack volume visualization (TCP vs UDP).
- **Protocol Distribution**: Breakdown of traffic by protocol (TCP, UDP, ICMP, GRE).
- **Attack Vectors**: Analysis of top attack methods (e.g., UDP Floods, SYN Floods, Mirai Botnet).
- **Attack Activity Map**: Flow data showing Source → Target attack paths.
- **TCP Quality Stats**: Monitoring of TCP connection resets and timeouts.

### 2. 🦠 CVE Intelligence (Level Blue OTX)
Deep dive into specific vulnerabilities (CVEs).
- **Indicators of Compromise (IoCs)**: Get related IPs, domains, and file hashes for any CVE.
- **Threat Pulses**: See how many security researchers are tracking a specific vulnerability.
- **Contextual Data**: Descriptions, references, and tags for each threat.

### 3. 🌍 Global Threat Landscape
- **Top Attack Sources**: Ranking of countries generating the most malicious traffic.
- **Global Traffic Summaries**: High-level view of internet traffic anomalies.
- **Live Threat Pulses**: Latest community-reported threats and campaigns.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
The server runs on **Port 3001** by default.
```bash
npm run dev
```

### 3. Verify Connectivity
Access the health check endpoint:
```bash
curl http://localhost:3001/api/health
```

---

## � API Endpoints Reference

### 🛡️ Network Security Dashboard (Layer 3)
Returns a complex dataset matching Cloudflare's security views. Perfect for visualizing network attacks.

**Endpoint:** `GET /api/threats/layer3`

**Response Data:**
- `volume_change`: Trend data for TCP/UDP traffic.
- `top_sources`: Top 10 countries originating attacks.
- `protocol_distribution`: Percentage breakdown (e.g., UDP 63%, TCP 35%).
- `attack_vectors`: Top methods (UDP Flood, SYN Flood, etc.).
- `flow_map`: Source country to Target country flow links (for Sankey charts).
- `tcp_quality`: Connection timeout and reset statistics.

**Example Usage:**
```bash
curl http://localhost:3001/api/threats/layer3
```

---

### 🦠 CVE & Threat Analysis
Search for specific CVEs to find actionable intelligence.

**Endpoint:** `GET /api/cve/:cveId`

**Parameters:**
- `cveId`: The CVE identifier (e.g., `CVE-2021-44228`)

**Response Data:**
- Related OTX Pulses
- Count of indicators
- Top references and author details

**Example Usage:**
```bash
curl http://localhost:3001/api/cve/CVE-2021-44228
```

---

### 🌍 Global Stats & Sources
Quick summaries of global activity.

| Feature | Endpoint | Description |
|---------|----------|-------------|
| **Global Summary** | `/api/threats/global` | General traffic and attack volume summary. |
| **Top Sources** | `/api/threats/top-sources` | List of top attacking countries with percentages. |
| **Latest Threats** | `/api/threats/pulses` | Most recent threat pulses from OTX community. |

---

### 🔍 Indicator Lookup
Investigate specific IPs or Domains.

**Endpoint:** `GET /api/threats/indicator/:type/:value`

**Parameters:**
- `type`: `IPv4`, `domain`, or `hostname`
- `value`: The actual IP or domain (e.g., `8.8.8.8`)

**Example Usage:**
```bash
curl http://localhost:3001/api/threats/indicator/IPv4/192.168.1.1
```

---

## ⚙️ Configuration

The application is pre-configured with the necessary API keys in `config/api.config.js`.

- **Port**: 3001 (configurable in `.env` or `server.js`)
- **Cloudflare Token**: Configured for Radar access.
- **OTX Key**: Configured for Threat Intelligence access.

## �️ Technology Stack

- **Node.js & Express**: Backend API framework.
- **Axios**: HTTP client for external API requests.
- **Node-Cache**: Caching layer to improve performance and reduce API usage.
- **Helmet**: Security headers.
- **Rate-Limiter**: Basic DDoS protection for the API itself.

## 📝 Developer Notes

- **Simulation Mode**: If the Cloudflare API key lacks permissions for specific Enterprise endpoints (like granular Attack Vectors), the service automatically falls back to a **high-fidelity simulation mode**. This ensures your frontend visuals never break and always have realistic data structures to render.
- **Net Flows**: Real network flow data is used wherever possible as it is generally accessible via standard tokens.

---

**Ready to explore?**
Visit **http://localhost:3001/** for the interactive endpoint list.
