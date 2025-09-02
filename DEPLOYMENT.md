# 🚀 DroneFlux Deployment Guide

This guide will help you deploy your DroneFlux system to production.

## 🏗️ Quick Setup (Local Development)

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### 1. Automated Setup
```bash
# Windows
./setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 2. Manual Setup

#### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run seed  # Initialize database with sample data
npm run dev   # Start development server
```

#### Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev   # Start development server
```

## 🌐 Production Deployment

### Backend Deployment Options

#### Option 1: Railway
1. Create account at railway.app
2. Connect your GitHub repository
3. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secure_jwt_secret
   SESSION_SECRET=your_secure_session_secret
   FRONTEND_URL=https://your-frontend-domain.com
   PORT=5000
   ```
4. Deploy automatically on push

#### Option 2: Heroku
1. Install Heroku CLI
2. Create new app: `heroku create droneflux-api`
3. Add MongoDB Atlas addon: `heroku addons:create mongolab`
4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set SESSION_SECRET=your_secure_session_secret
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```
5. Deploy: `git push heroku main`

#### Option 3: DigitalOcean App Platform
1. Create account at digitalocean.com
2. Create new app from GitHub
3. Configure environment variables
4. Deploy with automatic scaling

### Frontend Deployment Options

#### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. In Frontend folder: `vercel`
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```
4. Deploy: `vercel --prod`

#### Option 2: Netlify
1. Build project: `npm run build`
2. Drag `dist` folder to netlify.com
3. Set environment variables in Netlify dashboard
4. Enable continuous deployment

#### Option 3: AWS S3 + CloudFront
1. Build project: `npm run build`
2. Upload to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Create account at mongodb.com/atlas
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGO_URI` in environment variables

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/droneflux`

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/droneflux

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
SESSION_SECRET=your_super_secure_session_secret_key_here

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# URLs
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com
```

## 🔧 Production Optimizations

### Backend Optimizations
1. **Security Headers**
   ```javascript
   app.use(helmet());
   ```

2. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
   ```

3. **Compression**
   ```javascript
   app.use(compression());
   ```

4. **Logging**
   ```javascript
   const winston = require('winston');
   // Configure production logging
   ```

### Frontend Optimizations
1. **Build Optimization**
   ```bash
   npm run build
   ```

2. **Bundle Analysis**
   ```bash
   npm run build -- --analyze
   ```

3. **Service Worker** (for PWA)
   ```javascript
   // Add service worker for offline functionality
   ```

## 📊 Monitoring & Analytics

### Backend Monitoring
- Use PM2 for process management
- Set up error tracking (Sentry)
- Monitor performance (New Relic)
- Database monitoring (MongoDB Atlas)

### Frontend Monitoring
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring (Lighthouse)
- User behavior analytics

## 🔒 Security Checklist

### Backend Security
- ✅ Environment variables secured
- ✅ JWT tokens properly configured
- ✅ CORS properly configured
- ✅ Input validation implemented
- ✅ Rate limiting enabled
- ✅ HTTPS enforced
- ✅ Database connection secured

### Frontend Security
- ✅ API keys not exposed
- ✅ HTTPS enforced
- ✅ Content Security Policy
- ✅ XSS protection
- ✅ Secure authentication flow

## 🧪 Testing in Production

### Health Checks
```bash
# Backend health check
curl https://your-api-domain.com/

# Database connection test
curl https://your-api-domain.com/api/analytics/dashboard
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 5 https://your-api-domain.com/
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple backend instances
- Database read replicas
- CDN for static assets

### Performance Optimization
- Database indexing
- Query optimization
- Caching strategies
- Image optimization

## 🆘 Troubleshooting

### Common Issues

#### CORS Errors
- Check FRONTEND_URL in backend .env
- Verify CORS configuration
- Ensure proper headers

#### Database Connection
- Verify MongoDB URI
- Check network access
- Validate credentials

#### Authentication Issues
- Verify JWT_SECRET consistency
- Check token expiration
- Validate user permissions

### Debugging Tools
```bash
# Check logs
heroku logs --tail  # For Heroku
vercel logs         # For Vercel

# Database connection test
node -e "require('./Backend/config/db')()"
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity
5. Review CORS configuration

---

**Your DroneFlux system is now ready for production! 🚁✨**
