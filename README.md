# 🚁 DroneFlux - Drone Delivery Management System

A comprehensive drone delivery management platform built with Node.js, Express, React, and TypeScript. DroneFlux enables efficient management of drone fleets, order processing, delivery tracking, and user management with role-based access control.

## 🌟 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Google OAuth integration
- Role-based access control (Admin, Customer, Operator, Staff)
- Secure session management

### 📊 Dashboard & Analytics
- Real-time system overview
- Performance metrics and KPIs
- Interactive charts and visualizations
- Role-specific dashboard views

### 🚁 Drone Management
- Fleet monitoring and status tracking
- Battery level and maintenance alerts
- Location tracking with map integration
- Drone assignment and scheduling

### 📦 Order Management
- Complete order lifecycle management
- Real-time delivery tracking
- Customer order history
- Payment status monitoring

### 👥 User Management
- Multi-role user system
- Profile management
- Operator and staff assignments
- Customer relationship management

### 🗺️ Tracking & Mapping
- Real-time location tracking
- Interactive map interface
- Route optimization
- Delivery progress monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Passport.js** - OAuth integration
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **React Query** - Data fetching
- **Leaflet** - Maps integration

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
```

#### Frontend (.env)
```env
# Backend API URL
VITE_API_URL=http://localhost:5000
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

## 👤 User Roles

### 🔧 Admin
- Complete system access
- User management
- System analytics
- Drone fleet management
- Order oversight

### 👨‍💼 Operator
- Drone assignment and monitoring
- Flight planning and execution
- Delivery coordination
- Fleet status updates

### 📦 Staff
- Delivery management
- Package handling
- Customer communication
- Status updates

### 🛒 Customer
- Order placement and tracking
- Delivery history
- Profile management
- Payment processing

## 🗂️ Project Structure

```
droneflux-system/
├── Backend/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Drone.js
│   │   ├── Order.js
│   │   └── Assignment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── drones.js
│   │   ├── orders.js
│   │   ├── assignments.js
│   │   └── users.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── providers/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Drones
- `GET /api/drones` - Get all drones
- `POST /api/drones` - Create new drone
- `GET /api/drones/:id` - Get drone by ID
- `PUT /api/drones/:id` - Update drone
- `DELETE /api/drones/:id` - Delete drone
- `PATCH /api/drones/:id/status` - Update drone status

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/assign` - Assign drone/operator

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment
- `GET /api/assignments/:id` - Get assignment by ID
- `PUT /api/assignments/:id` - Update assignment
- `PATCH /api/assignments/:id/status` - Update assignment status

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/role/operators` - Get operators list

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or Vercel

### Frontend Deployment
1. Build the production version
   ```bash
   cd Frontend
   npm run build
   ```
2. Deploy to platforms like Vercel, Netlify, or AWS S3

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

## 🙏 Acknowledgments

- React and Node.js communities
- shadcn/ui for beautiful components
- Leaflet for mapping capabilities
- All contributors and testers

---

**Built with ❤️ for efficient drone delivery management**
