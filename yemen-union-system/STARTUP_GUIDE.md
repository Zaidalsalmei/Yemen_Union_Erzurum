# Yemen Union System - Startup Guide

## 🚀 Quick Start

### Option 1: Double-Click (Recommended)
Simply double-click `START.bat` in the project root.

### Option 2: PowerShell
```powershell
cd c:\xampp\htdocs\projects\yemen-union-system
.\start-system.ps1
```

### Option 3: Manual Start
```bash
# Terminal 1 - Backend
cd backend
php -S localhost:8000 -t public public/router.php

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📋 Prerequisites

1. **XAMPP** with MySQL running
2. **PHP 8.1+** in system PATH
3. **Node.js 18+** and npm
4. **Database** `yemen_union_db` created in MySQL

---

## 🔧 Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yemen_union_db
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=YemenUnion2024SecureKey...
CORS_ORIGIN=http://localhost:5176
```

### Frontend (vite.config.ts)
- **Port**: 5176 (fixed, never changes)
- **strictPort**: true (fails if port busy)

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5176 |
| Backend | http://localhost:8000 |
| API | http://localhost:8000/api |
| Health Check | http://localhost:8000/api/health |

---

## 🔍 Health Check Response

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-12-09T17:00:00+03:00",
  "environment": "development",
  "services": {
    "api": "ok",
    "database": "connected",
    "jwt": "configured",
    "cors_origin": "http://localhost:5176"
  },
  "system": {
    "php_version": "8.2.0",
    "memory_usage_mb": 2.5,
    "timezone": "Europe/Istanbul"
  }
}
```

---

## 🛠 Troubleshooting

### Database Connection Failed
1. Check XAMPP MySQL is running
2. Verify database `yemen_union_db` exists
3. Check `.env` credentials

### Port Already in Use
1. The script automatically kills processes on ports 8000 and 5176
2. Or manually: `netstat -ano | findstr :8000`

### CORS Errors
1. Ensure `CORS_ORIGIN` in `.env` matches frontend URL
2. Check browser console for specific error

### Refresh Loop
1. Verify Vite is running on port 5176
2. Check `strictPort: true` in vite.config.ts
3. Clear browser cache

---

## 📁 Project Structure

```
yemen-union-system/
├── START.bat              # Quick start (double-click)
├── start-system.ps1       # PowerShell startup script
├── backend/
│   ├── .env               # Environment config
│   ├── public/
│   │   ├── index.php      # API entry point
│   │   └── router.php     # Built-in server router
│   └── src/
│       ├── Controllers/
│       ├── Middleware/
│       │   └── CorsMiddleware.php
│       └── Routes/
│           └── api.php
└── frontend/
    ├── vite.config.ts     # Vite config (port 5176)
    └── src/
```

---

## ✅ Startup Pipeline

1. ✓ Validate `.env` file
2. ✓ Check database connectivity
3. ✓ Kill existing processes on ports
4. ✓ Start backend (PHP server)
5. ✓ Start frontend (Vite)
6. ✓ Run health check
7. ✓ Open browser

---

Last Updated: 2024-12-09
