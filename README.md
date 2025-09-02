# 🚁 DroneFlux - Production Ready

A comprehensive drone delivery management system built with React, Node.js, and MongoDB. Now production-ready and deployable on Vercel.

## ✨ Features

- 👥 **User Management** - Role-based authentication (Admin, Customer, Operator, Staff)
- 🔐 **Google OAuth Integration** - Secure social login
- 📸 **Profile Pictures** - Upload and manage user avatars with database storage
- 🚁 **Drone Fleet Management** - Complete drone lifecycle management
- 📦 **Order Tracking** - Real-time order status and delivery tracking
- 🚨 **Emergency Management** - Priority emergency delivery system
- 📊 **Live Simulation** - Real-time drone simulation with telemetry
- 📈 **Analytics Dashboard** - Comprehensive business insights
- 🔄 **Real-time Updates** - WebSocket-powered live updates
- 📱 **Responsive Design** - Mobile-first responsive interface

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching
- **Socket.IO Client** for real-time updates
- **React Router** for navigation
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google OAuth 2.0** for social login
- **Socket.IO** for real-time communication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Deployment
- **Vercel** for both frontend and backend
- **MongoDB Atlas** for production database
- **Environment-based configuration**

## 🌟 Key Features

### 🛒 **E-Commerce Store**
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add items, manage quantities, apply coupons
- **Checkout Process**: Multi-step checkout with shipping options
- **Payment Integration**: Multiple payment methods (Credit Card, PayPal, Apple Pay, Google Pay)
- **Drone Delivery Options**: Choose from standard, express, same-day, or drone delivery

### 📱 **Real-Time Order Tracking**
- **Live Order Status**: Real-time updates from order placement to delivery
- **Drone Assignment**: Automatic drone assignment based on availability and location
- **Live Map Tracking**: Interactive maps showing order and drone locations
- **Status Timeline**: Visual progress tracking with timestamps
- **Customer Notifications**: Real-time updates via WebSocket

### 🚁 **Live Drone Management**
- **Real-Time Location**: Live GPS tracking of all drones
- **Battery Monitoring**: Real-time battery level and charging status
- **Status Updates**: Live status changes (available, in-transit, charging, maintenance)
- **Emergency Controls**: Emergency landing and route recalculation
- **Performance Metrics**: Delivery success rates, distance traveled, efficiency

### 📊 **Comprehensive Dashboard**
- **Order Management**: Complete order lifecycle management
- **Drone Fleet**: Monitor and manage drone fleet
- **Live Tracking**: Real-time monitoring of active deliveries
- **Analytics**: Performance metrics and business intelligence
- **User Management**: Role-based access control

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication and authorization
- **Passport.js** - OAuth integration
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications
- **Cron** - Scheduled tasks

### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Leaflet** - Interactive maps
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling with validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd droneflux-system
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/droneflux
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/droneflux

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_here

# Session Secret
SESSION_SECRET=your_secure_session_secret_here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000

# Payment Processing (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (.env)
```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# WebSocket URL
VITE_WS_URL=ws://localhost:5000

# Payment (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Running the Application

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - WebSocket: ws://localhost:5000

## 🗂️ System Architecture

### Core Modules

#### 1. **E-Commerce Module**
- Product management and catalog
- Shopping cart functionality
- Checkout and payment processing
- Order creation and management

#### 2. **Drone Management Module**
- Drone fleet management
- Real-time location tracking
- Battery and status monitoring
- Assignment and scheduling

#### 3. **Order Management Module**
- Order lifecycle management
- Drone assignment algorithms
- Route optimization
- Delivery tracking

#### 4. **Real-Time Tracking Module**
- WebSocket-based live updates
- Interactive map visualization
- Status monitoring
- Customer notifications

#### 5. **User Management Module**
- Role-based access control
- Customer profiles
- Operator management
- Staff coordination

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### E-Commerce
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - Get product categories

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove item from cart
- `POST /api/cart/coupons` - Apply coupon
- `PUT /api/cart/shipping-address` - Update shipping address

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/assign` - Assign drone to order
- `GET /api/orders/:id/tracking` - Get order tracking info

### Drones
- `GET /api/drones` - Get all drones
- `POST /api/drones` - Create new drone
- `GET /api/drones/:id` - Get drone by ID
- `PUT /api/drones/:id` - Update drone
- `PATCH /api/drones/:id/location` - Update drone location
- `PATCH /api/drones/:id/status` - Update drone status
- `PATCH /api/drones/:id/battery` - Update battery level

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment
- `GET /api/assignments/:id` - Get assignment by ID
- `PUT /api/assignments/:id` - Update assignment
- `PATCH /api/assignments/:id/status` - Update assignment status

## 🔄 Real-Time Features

### WebSocket Events

#### Order Updates
- `order-updated` - Order status or details changed
- `new-order` - New order created
- `drone-assigned` - Drone assigned to order

#### Drone Updates
- `drone-location-updated` - Drone location changed
- `drone-status-updated` - Drone status changed
- `drone-battery-updated` - Battery level changed
- `drone-emergency` - Emergency situation

#### Customer Notifications
- `delivery-started` - Delivery initiated
- `delivery-completed` - Delivery completed
- `eta-updated` - Estimated delivery time changed

## 📱 User Roles & Permissions

### 🔧 **Admin**
- Complete system access
- User and role management
- System analytics and reporting
- Drone fleet management
- Order oversight and management

### 👨‍💼 **Operator**
- Drone assignment and monitoring
- Flight planning and execution
- Delivery coordination
- Fleet status updates
- Live tracking access

### 📦 **Staff**
- Delivery management
- Package handling
- Customer communication
- Status updates
- Order processing

### 🛒 **Customer**
- Product browsing and purchasing
- Shopping cart management
- Order placement and tracking
- Delivery history
- Profile management

## 🗺️ Live Tracking Features

### Real-Time Map
- **Interactive Maps**: Leaflet-based interactive maps
- **Live Updates**: Real-time location updates every 5 seconds
- **Multiple Views**: 2D and 3D map views
- **Customizable**: Configurable refresh intervals and tracking modes

### Drone Tracking
- **Live Location**: Real-time GPS coordinates
- **Status Monitoring**: Live status updates
- **Battery Tracking**: Real-time battery level monitoring
- **Route Visualization**: Current flight paths and destinations

### Order Tracking
- **Status Timeline**: Visual progress tracking
- **ETA Updates**: Real-time delivery time estimates
- **Location History**: Complete delivery journey tracking
- **Customer Updates**: Real-time notifications

## 🚚 Delivery Options

### Shipping Methods
1. **Standard Delivery** (3-5 business days) - Free
2. **Express Delivery** (1-2 business days) - $12.99
3. **Same Day Delivery** (Within 24 hours) - $24.99
4. **Drone Delivery** (Within 2 hours) - $19.99

### Delivery Preferences
- **Time Slots**: Morning, Afternoon, Evening, or Anytime
- **Special Instructions**: Custom delivery notes
- **Contact Person**: Alternative contact for delivery
- **Location Details**: Specific delivery location information

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission management
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin resource sharing security
- **Password Hashing**: Secure password storage with bcrypt

## 📊 Analytics & Reporting

### Performance Metrics
- **Delivery Success Rate**: Percentage of successful deliveries
- **Average Delivery Time**: Mean time from order to delivery
- **Drone Efficiency**: Utilization and performance metrics
- **Customer Satisfaction**: Ratings and feedback analysis

### Business Intelligence
- **Order Trends**: Daily, weekly, monthly order patterns
- **Revenue Analytics**: Sales performance and growth
- **Geographic Analysis**: Delivery area performance
- **Operational Metrics**: Fleet utilization and efficiency

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# End-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables for production
3. Set up SSL certificates
4. Deploy to platforms like:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS EC2

### Frontend Deployment
1. Build the production version
   ```bash
   cd Frontend
   npm run build
   ```
2. Deploy to platforms like:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

### Environment Setup
- Configure production environment variables
- Set up monitoring and logging
- Configure backup and recovery
- Set up CI/CD pipelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Contact the development team
4. Review the documentation

## 🙏 Acknowledgments

- React and Node.js communities
- shadcn/ui for beautiful components
- Leaflet for mapping capabilities
- Socket.IO for real-time communication
- All contributors and testers

## 🔮 Future Enhancements

### Planned Features
- **AI-Powered Route Optimization**: Machine learning for optimal delivery routes
- **Predictive Analytics**: Forecast delivery times and demand
- **Mobile Apps**: Native iOS and Android applications
- **IoT Integration**: Smart sensors and real-time monitoring
- **Blockchain**: Secure delivery verification and tracking
- **Multi-Language Support**: Internationalization
- **Advanced Analytics**: Business intelligence dashboard
- **API Marketplace**: Third-party integrations

### Technology Roadmap
- **Microservices Architecture**: Scalable service-based architecture
- **GraphQL API**: Flexible data querying
- **Real-Time Analytics**: Live business intelligence
- **Machine Learning**: Predictive maintenance and optimization
- **Edge Computing**: Distributed processing for faster response times

---

**Built with ❤️ for efficient e-commerce drone delivery management**

*Transform your delivery business with DroneFlux - The future of drone delivery is here!*
