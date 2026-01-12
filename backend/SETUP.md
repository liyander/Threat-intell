# 🎯 SETUP GUIDE - Web Scraping Version

## ✅ What Changed?

I've **completely rebuilt** the application to use **web scraping** instead of the Shodan API!

### Before (API Version):
- ❌ Required Shodan API key
- ❌ Consumed API credits
- ❌ Needed Shodan account

### Now (Scraping Version):
- ✅ **NO API key required!**
- ✅ **NO credits needed!**
- ✅ **NO Shodan account needed!**
- ✅ Scrapes public Shodan website directly

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

**Note:** This will install Puppeteer (headless Chrome), which is ~300MB. Be patient!

### Step 2: Start the Server
```bash
npm run dev
```

### Step 3: Test It!
```bash
curl http://localhost:3000/api/health
```

**That's it!** No API key configuration needed! 🎉

---

## 🔍 How It Works

Instead of calling Shodan's API, this tool:

1. **Launches a headless Chrome browser** (using Puppeteer)
2. **Navigates to Shodan's public search pages**
3. **Extracts data from the HTML** (using Cheerio)
4. **Returns structured JSON data**

### Visual Flow:
```
Your Request
    ↓
Express API
    ↓
Puppeteer (Headless Chrome)
    ↓
Shodan.io Website
    ↓
HTML Response
    ↓
Cheerio Parser
    ↓
Structured JSON
    ↓
Your Response
```

---

## 📊 Example Usage

### Search for Log4Shell
```bash
curl http://localhost:3000/api/cve/CVE-2021-44228
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": {
      "cve": "CVE-2021-44228",
      "page": 1
    },
    "summary": {
      "total": 50000,
      "returned": 10
    },
    "hosts": [
      {
        "ip": "192.168.1.1",
        "port": 443,
        "organization": "Example Org",
        "location": {
          "city": "New York",
          "country": "United States"
        }
      }
    ]
  }
}
```

### Get Statistics
```bash
curl http://localhost:3000/api/cve/CVE-2021-44228/count
```

### Search by Component
```bash
curl "http://localhost:3000/api/component/Apache"
```

---

## ⚙️ Configuration (Optional)

The `.env` file is now **optional**. Default settings work fine!

If you want to customize:
```env
PORT=3000
NODE_ENV=development
RATE_LIMIT_MAX_REQUESTS=20
```

**No API key needed!**

---

## ⚠️ Important Differences

### Speed
- **API Version:** ~1-2 seconds per request
- **Scraping Version:** ~10-30 seconds per request

**Why slower?**
- Launches a real browser
- Loads full web pages
- Waits for JavaScript to render

### Results
- **API Version:** 100 results per page
- **Scraping Version:** ~10 results per page (what Shodan shows publicly)

### Reliability
- **API Version:** Very reliable
- **Scraping Version:** May break if Shodan changes their HTML

---

## 🎯 When to Use This

### ✅ Good For:
- Learning and testing
- Small-scale research
- When you don't have API credits
- Quick one-off queries
- Demonstration purposes

### ❌ Not Good For:
- Large-scale scanning
- Production applications
- Time-sensitive operations
- Bulk data collection

---

## 🔧 Troubleshooting

### "Scraping timeout"
**Cause:** Shodan is slow or blocking
**Solution:** 
- Wait a few minutes
- Try again
- Check if shodan.io is accessible

### "Navigation failed"
**Cause:** Network issue
**Solution:**
- Check internet connection
- Try accessing shodan.io in browser
- Check firewall settings

### Very slow first request
**Cause:** Browser initialization
**Solution:**
- This is normal!
- First request: ~30 seconds
- Subsequent requests: ~10-15 seconds

### Installation taking forever
**Cause:** Puppeteer is downloading Chromium (~300MB)
**Solution:**
- Be patient
- Ensure stable internet
- Don't interrupt the installation

---

## 📚 Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /api/health` | Health check | `curl http://localhost:3000/api/health` |
| `GET /api/cve/:cveId` | Search by CVE | `curl http://localhost:3000/api/cve/CVE-2021-44228` |
| `GET /api/cve/:cveId/count` | Get count | `curl http://localhost:3000/api/cve/CVE-2021-44228/count` |
| `GET /api/cve/:cveId/components` | Get components | `curl http://localhost:3000/api/cve/CVE-2021-44228/components` |
| `GET /api/cve/:cveId/services` | Get services | `curl http://localhost:3000/api/cve/CVE-2021-44228/services` |
| `GET /api/component/:name` | Search component | `curl http://localhost:3000/api/component/Apache` |
| `GET /api/component/:name/vulnerable` | Find vulnerable | `curl http://localhost:3000/api/component/Apache/vulnerable` |

---

## 🎓 Example CVEs

Try these popular CVEs:

```bash
# Log4Shell
curl http://localhost:3000/api/cve/CVE-2021-44228

# Spring4Shell
curl http://localhost:3000/api/cve/CVE-2022-22965

# Heartbleed
curl http://localhost:3000/api/cve/CVE-2014-0160

# ProxyLogon
curl http://localhost:3000/api/cve/CVE-2021-26855
```

---

## 💡 Pro Tips

1. **Be Patient:** First request takes longer (browser startup)
2. **Use Rate Limiting:** Don't spam requests
3. **Check Browser:** Visit http://localhost:3000/ for docs
4. **Monitor Logs:** Watch console for scraping progress
5. **Test Small:** Start with one CVE before bulk queries

---

## 🔐 Ethical Use

✅ **DO:**
- Use for authorized research
- Respect rate limits
- Be patient with requests
- Use for learning

❌ **DON'T:**
- Abuse the service
- Make excessive requests
- Use for malicious purposes
- Violate Shodan's ToS

---

## 🆘 Need Help?

1. **Check the logs** - Console shows scraping progress
2. **Visit the docs** - http://localhost:3000/
3. **Read README.md** - Full documentation
4. **Test health endpoint** - Verify server is running

---

## ✨ You're Ready!

Once `npm install` finishes, just run:

```bash
npm run dev
```

Then visit: **http://localhost:3000/**

**No API key needed!** 🎉

---

## 📝 Summary

| Feature | Status |
|---------|--------|
| API Key Required | ❌ NO |
| Shodan Account | ❌ NO |
| Installation | ✅ npm install |
| Configuration | ✅ Optional |
| Ready to Use | ✅ YES |

**Happy Scraping! 🔍**
