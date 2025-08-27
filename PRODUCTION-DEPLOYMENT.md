# 🚀 DroneFlux Production Deployment on Vercel

Complete guide for deploying DroneFlux drone delivery management system to production.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Google OAuth credentials configured
- [ ] Vercel account setup
- [ ] Environment variables prepared
- [ ] Domain names ready (optional)

## 🔧 Quick Deployment Commands

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy backend
cd Backend
vercel --prod

# Deploy frontend  
cd Frontend
vercel --prod
```

## 🌍 Environment Variables Setup

### Backend Production Variables
Set these in Vercel Dashboard for your backend deployment:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/droneflux-prod?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-min-32-chars
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
SESSION_SECRET=your-super-secure-session-secret-for-production
FRONTEND_URL=https://your-frontend-app.vercel.app
CORS_ORIGINS=https://your-frontend-app.vercel.app
```

### Frontend Production Variables
Set these in Vercel Dashboard for your frontend deployment:

```env
NODE_ENV=production
VITE_API_URL=https://your-backend-api.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_WS_URL=wss://your-backend-api.vercel.app
VITE_APP_NAME=DroneFlux
VITE_APP_VERSION=1.0.0
```

## 🗄️ MongoDB Atlas Production Setup

### 1. Create Production Cluster
```bash
1. Go to https://cloud.mongodb.com
2. Create new project: "DroneFlux-Production"
3. Build cluster (M0 free tier for testing, M2+ for production)
4. Choose region closest to your users
5. Cluster name: "droneflux-prod"
```

### 2. Database Security
```bash
1. Database Access → Add New Database User
   - Username: droneflux-prod
   - Password: Generate secure password
   - Role: Atlas admin or Read/Write to any database

2. Network Access → Add IP Address
   - Add: 0.0.0.0/0 (Allow access from anywhere)
   - Or add specific Vercel IP ranges for better security
```

### 3. Get Connection String
```bash
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace <password> with your database user password
5. Replace <dbname> with "droneflux-prod"
```

## 🔐 Google OAuth Production Setup

### 1. Google Cloud Console Configuration
```bash
1. Go to https://console.cloud.google.com
2. Create new project: "DroneFlux Production"
3. Enable APIs:
   - Google+ API
   - Google OAuth2 API
   - Google People API
```

### 2. OAuth Consent Screen
```bash
1. OAuth consent screen → External
2. App name: "DroneFlux"
3. User support email: your-email@domain.com
4. Developer contact: your-email@domain.com
5. Add scopes: email, profile, openid
```

### 3. OAuth Credentials
```bash
1. Credentials → Create Credentials → OAuth 2.0 Client ID
2. Application type: Web application
3. Name: "DroneFlux Production"
4. Authorized JavaScript origins:
   - https://your-frontend.vercel.app
   - https://your-backend.vercel.app
5. Authorized redirect URIs:
   - https://your-backend.vercel.app/api/auth/google/callback
```

## 🚀 Vercel Deployment Process

### Backend Deployment
```bash
cd Backend

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NODE_ENV
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SESSION_SECRET
vercel env add FRONTEND_URL
vercel env add CORS_ORIGINS
```

### Frontend Deployment
```bash
cd Frontend

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NODE_ENV
vercel env add VITE_API_URL
vercel env add VITE_GOOGLE_CLIENT_ID
vercel env add VITE_WS_URL
vercel env add VITE_APP_NAME
vercel env add VITE_APP_VERSION
```

## 🔄 Automated Deployment Setup

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Backend
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.BACKEND_PROJECT_ID }}
          working-directory: ./Backend
          vercel-args: '--prod'

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Frontend
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.FRONTEND_PROJECT_ID }}
          working-directory: ./Frontend
          vercel-args: '--prod'
```

## ✅ Post-Deployment Testing

### API Health Check
```bash
# Test backend health
curl https://your-backend.vercel.app/

# Test authentication
curl https://your-backend.vercel.app/api/auth/me

# Test database connection
curl https://your-backend.vercel.app/api/analytics/dashboard
```

### Frontend Testing
```bash
# Open in browser
https://your-frontend.vercel.app

# Test features:
1. User registration/login
2. Google OAuth login
3. Dashboard navigation
4. Profile picture upload
5. Drone management
6. Order creation
7. Real-time updates
8. Emergency management
9. Simulation controls
```

### WebSocket Testing
```javascript
// Test in browser console
const socket = io('wss://your-backend.vercel.app');
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

## 📊 Production Monitoring

### Vercel Analytics
```bash
1. Enable Vercel Analytics in dashboard
2. Monitor function execution times
3. Track deployment success rates
4. Monitor bandwidth usage
```

### MongoDB Atlas Monitoring
```bash
1. Set up alerts for high CPU/memory
2. Monitor connection counts
3. Track slow queries
4. Set up backup schedules
```

### Error Tracking (Optional)
```bash
# Install Sentry
npm install @sentry/node @sentry/react

# Configure in production
SENTRY_DSN=your-sentry-dsn
```

## 🔒 Security Configuration

### SSL/HTTPS
- Vercel automatically provides SSL certificates
- Ensure all API calls use HTTPS
- Configure HSTS headers

### CORS Security
```javascript
// Backend CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Rate Limiting
```javascript
// Add to backend for production
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 📈 Performance Optimization

### Database Optimization
```javascript
// Add indexes for better performance
db.users.createIndex({ email: 1 });
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.assignments.createIndex({ operator: 1, status: 1 });
db.telemetry.createIndex({ droneId: 1, timestamp: -1 });
```

### Frontend Optimization
```bash
# Build optimization
npm run build

# Bundle analysis
npm install --save-dev webpack-bundle-analyzer
npm run build -- --analyze
```

### CDN Configuration
- Vercel automatically provides global CDN
- Optimize images and static assets
- Enable compression for all responses

## 🆘 Troubleshooting

### Common Issues

**CORS Errors**
```bash
# Check CORS_ORIGINS environment variable
# Verify frontend URL matches exactly
# Ensure no trailing slashes in URLs
```

**Database Connection Failed**
```bash
# Verify MongoDB Atlas IP whitelist
# Check connection string format
# Ensure database user has proper permissions
# Test connection locally first
```

**OAuth Issues**
```bash
# Verify redirect URIs in Google Console
# Check client ID/secret in environment variables
# Ensure APIs are enabled in Google Cloud
```

**Function Timeout**
```bash
# Increase timeout in vercel.json
# Optimize database queries
# Add proper error handling
```

### Debug Commands
```bash
# View deployment logs
vercel logs <deployment-url>

# Check environment variables
vercel env ls

# Test specific endpoints
curl -X GET https://your-backend.vercel.app/api/health

# Check function performance
vercel inspect <deployment-url>
```

## 🎯 Production URLs

After successful deployment:

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api`
- **Admin Dashboard**: `https://your-frontend.vercel.app/admin`
- **API Documentation**: `https://your-backend.vercel.app/api/docs`

## 📞 Support & Maintenance

### Regular Maintenance
- Monitor error rates and performance
- Update dependencies monthly
- Review security patches
- Backup database regularly
- Monitor usage and scaling needs

### Scaling Considerations
- **Database**: Upgrade MongoDB Atlas tier as needed
- **Vercel**: Consider Pro plan for better performance
- **CDN**: Add Cloudflare for additional optimization
- **Monitoring**: Implement comprehensive logging

---

**🎉 Your DroneFlux system is now production-ready on Vercel!**

**Features Available:**
- ✅ User Management & Authentication
- ✅ Google OAuth Integration
- ✅ Profile Picture Upload/Storage
- ✅ Drone Fleet Management
- ✅ Order Tracking & Management
- ✅ Real-time Emergency Alerts
- ✅ Live Drone Simulation
- ✅ Analytics Dashboard
- ✅ Role-based Access Control
- ✅ WebSocket Real-time Updates

**Tech Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB
- Deployment: Vercel (Frontend & Backend)
- Database: MongoDB Atlas
- Authentication: JWT + Google OAuth
- Real-time: Socket.IO
