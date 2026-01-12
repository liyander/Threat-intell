# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  (Browser, cURL, Postman, Custom App)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                           │
│                     (server.js)                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MIDDLEWARE LAYER                        │  │
│  │  • Helmet (Security Headers)                         │  │
│  │  • CORS (Cross-Origin)                               │  │
│  │  • Rate Limiter (Abuse Prevention)                   │  │
│  │  • Error Handler (Global Error Handling)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 ROUTING LAYER                        │  │
│  │                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │ API Routes │  │ CVE Routes │  │ Component    │  │  │
│  │  │            │  │            │  │ Routes       │  │  │
│  │  │ /api/      │  │ /api/cve/  │  │ /api/        │  │  │
│  │  │ health     │  │ :cveId     │  │ component/   │  │  │
│  │  │ info       │  │ count      │  │ :name        │  │  │
│  │  │            │  │ components │  │ vulnerable   │  │  │
│  │  │            │  │ services   │  │              │  │  │
│  │  └────────────┘  └────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SERVICE LAYER                           │  │
│  │          (services/shodanService.js)                 │  │
│  │                                                      │  │
│  │  • searchByCVE()                                     │  │
│  │  • searchByComponent()                               │  │
│  │  • getCountByCVE()                                   │  │
│  │  • formatSearchResults()                             │  │
│  │  • handleError()                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SHODAN API                                │
│              (api.shodan.io)                                │
│                                                             │
│  • /shodan/host/search                                      │
│  • /shodan/host/count                                       │
│  • /api-info                                                │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Request Flow

### Example: Searching for CVE-2021-44228

```
1. CLIENT REQUEST
   GET /api/cve/CVE-2021-44228?page=1&limit=10
   │
   ▼
2. MIDDLEWARE PROCESSING
   ├─ Rate Limiter: Check request count ✓
   ├─ Helmet: Add security headers ✓
   └─ CORS: Validate origin ✓
   │
   ▼
3. ROUTE HANDLER (cveRoutes.js)
   ├─ Validate CVE format ✓
   ├─ Parse query parameters
   └─ Call shodanService.searchByCVE()
   │
   ▼
4. SERVICE LAYER (shodanService.js)
   ├─ Construct Shodan query: "vuln:CVE-2021-44228"
   ├─ Add pagination: page=1, limit=10
   ├─ Make HTTP request to Shodan API
   └─ Wait for response
   │
   ▼
5. SHODAN API
   ├─ Process query
   ├─ Search database
   └─ Return results
   │
   ▼
6. DATA PROCESSING (shodanService.js)
   ├─ Format raw Shodan data
   ├─ Extract hosts information
   ├─ Extract services information
   ├─ Extract components information
   └─ Aggregate facets
   │
   ▼
7. RESPONSE TO CLIENT
   {
     "success": true,
     "data": {
       "query": {...},
       "summary": {...},
       "hosts": [...],
       "services": [...],
       "components": [...]
     }
   }
```

## 🔄 Data Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. HTTP Request
     │    GET /api/cve/CVE-2021-44228
     ▼
┌─────────────────┐
│  Rate Limiter   │ ──── Check: Within limits?
└────┬────────────┘
     │ 2. Pass through
     ▼
┌─────────────────┐
│  Route Handler  │ ──── Validate: CVE format OK?
└────┬────────────┘
     │ 3. Valid request
     ▼
┌─────────────────┐
│ Shodan Service  │ ──── Build: Shodan query
└────┬────────────┘
     │ 4. API call
     │    GET https://api.shodan.io/shodan/host/search
     │    ?key=XXX&query=vuln:CVE-2021-44228
     ▼
┌─────────────────┐
│   Shodan API    │ ──── Search: Vulnerability database
└────┬────────────┘
     │ 5. Raw results
     ▼
┌─────────────────┐
│ Format Results  │ ──── Transform: Raw → Structured
└────┬────────────┘
     │ 6. Formatted data
     ▼
┌─────────────────┐
│  JSON Response  │ ──── Return: Success + Data
└────┬────────────┘
     │ 7. HTTP Response
     ▼
┌──────────┐
│  Client  │ ──── Display: Results
└──────────┘
```

## 🗂️ File Responsibilities

### Configuration Layer
```
config/shodan.config.js
├─ API endpoints
├─ Default facets
├─ Pagination limits
└─ Base URL
```

### Middleware Layer
```
middleware/
├─ errorHandler.js
│  ├─ Global error catching
│  ├─ Error formatting
│  └─ 404 handling
│
└─ rateLimiter.js
   ├─ Request counting
   ├─ IP-based limiting
   └─ Custom limits
```

### Routing Layer
```
routes/
├─ apiRoutes.js
│  ├─ /api/health
│  └─ /api/info
│
├─ cveRoutes.js
│  ├─ /api/cve/:cveId
│  ├─ /api/cve/:cveId/count
│  ├─ /api/cve/:cveId/components
│  └─ /api/cve/:cveId/services
│
└─ componentRoutes.js
   ├─ /api/component/:name
   └─ /api/component/:name/vulnerable
```

### Service Layer
```
services/shodanService.js
├─ searchByCVE()
│  └─ Search hosts by CVE
│
├─ searchByComponent()
│  └─ Search by product/component
│
├─ getCountByCVE()
│  └─ Get statistics
│
├─ formatSearchResults()
│  └─ Transform API response
│
└─ handleError()
   └─ Process API errors
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│         SECURITY ARCHITECTURE           │
└─────────────────────────────────────────┘

Layer 1: Network Security
├─ HTTPS (when deployed)
└─ CORS (Cross-Origin Resource Sharing)

Layer 2: Application Security
├─ Helmet (Security Headers)
│  ├─ X-Content-Type-Options
│  ├─ X-Frame-Options
│  ├─ X-XSS-Protection
│  └─ Strict-Transport-Security
│
└─ Rate Limiting
   ├─ Per-IP tracking
   ├─ Time windows
   └─ Request caps

Layer 3: Input Validation
├─ CVE format validation
├─ Parameter sanitization
└─ Query string validation

Layer 4: Error Handling
├─ Sanitized error messages
├─ No stack traces in production
└─ Logged errors

Layer 5: Environment Security
├─ .env for secrets
├─ .gitignore protection
└─ No hardcoded credentials
```

## 📈 Scalability Considerations

### Current Architecture
- Single server instance
- In-memory rate limiting
- Synchronous request handling

### Future Enhancements
```
┌─────────────────────────────────────┐
│      POTENTIAL IMPROVEMENTS         │
└─────────────────────────────────────┘

1. Caching Layer
   └─ Redis for frequent queries

2. Database Layer
   └─ Store historical data

3. Queue System
   └─ Background job processing

4. Load Balancer
   └─ Multiple server instances

5. Monitoring
   └─ Logging & analytics

6. Authentication
   └─ API key management
```

## 🎯 API Endpoint Map

```
http://localhost:3000/
│
├─ /api/
│  │
│  ├─ health ──────────────► Health check
│  │
│  ├─ info ────────────────► Shodan API info
│  │
│  ├─ cve/
│  │  │
│  │  ├─ :cveId ───────────► Search by CVE
│  │  │
│  │  ├─ :cveId/count ─────► Get statistics
│  │  │
│  │  ├─ :cveId/components ► List components
│  │  │
│  │  └─ :cveId/services ──► List services
│  │
│  └─ component/
│     │
│     ├─ :name ────────────► Search component
│     │
│     └─ :name/vulnerable ─► Find vulnerable
│
└─ / ──────────────────────► API documentation
```

---

This architecture provides:
✅ Separation of concerns
✅ Easy to maintain
✅ Scalable design
✅ Security-first approach
✅ Clear data flow
