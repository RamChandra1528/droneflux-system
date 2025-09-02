require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Drone = require('../models/Drone');
const Order = require('../models/Order');
const Assignment = require('../models/Assignment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedUsers = async () => {
  console.log('Seeding users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@droneflux.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      name: 'John Customer',
      email: 'john@example.com',
      password: 'customer123',
      role: 'customer'
    },
    {
      name: 'Mike Operator',
      email: 'mike@droneflux.com',
      password: 'operator123',
      role: 'operator'
    },
    {
      name: 'Sarah Staff',
      email: 'sarah@droneflux.com',
      password: 'staff123',
      role: 'staff'
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    }
  }
};

const seedDrones = async () => {
  console.log('Seeding drones...');
  
  const drones = [
    {
      droneId: 'DRN001',
      model: 'DJI Mavic 3',
      status: 'available',
      batteryLevel: 98,
      location: { latitude: 40.712776, longitude: -74.005974 },
      maxPayload: 2.5,
      maxRange: 30,
      flightHours: 120
    },
    {
      droneId: 'DRN002',
      model: 'Skydio 2',
      status: 'in_flight',
      batteryLevel: 72,
      location: { latitude: 40.730610, longitude: -73.935242 },
      maxPayload: 1.8,
      maxRange: 25,
      flightHours: 85
    },
    {
      droneId: 'DRN003',
      model: 'FreeFly Alta X',
      status: 'maintenance',
      batteryLevel: 45,
      location: { latitude: 40.758896, longitude: -73.985130 },
      maxPayload: 5.0,
      maxRange: 20,
      flightHours: 200
    },
    {
      droneId: 'DRN004',
      model: 'Autel EVO II',
      status: 'charging',
      batteryLevel: 22,
      location: { latitude: 40.712775, longitude: -74.005973 },
      maxPayload: 2.0,
      maxRange: 28,
      flightHours: 95
    },
    {
      droneId: 'DRN005',
      model: 'DJI Matrice 300',
      status: 'available',
      batteryLevel: 87,
      location: { latitude: 40.753182, longitude: -73.982253 },
      maxPayload: 4.5,
      maxRange: 35,
      flightHours: 150
    }
  ];

  for (const droneData of drones) {
    const existingDrone = await Drone.findOne({ droneId: droneData.droneId });
    if (!existingDrone) {
      await Drone.create(droneData);
      console.log(`Created drone: ${droneData.droneId}`);
    }
  }
};

const seedOrders = async () => {
  console.log('Seeding orders...');
  
  const customer = await User.findOne({ role: 'customer' });
  const operator = await User.findOne({ role: 'operator' });
  const drone = await Drone.findOne({ status: 'available' });
  
  if (!customer || !operator || !drone) {
    console.log('Required users or drones not found, skipping order seeding');
    return;
  }

  const orders = [
    {
      customer: customer._id,
      pickupLocation: {
        address: '123 Broadway, New York, NY',
        latitude: 40.712776,
        longitude: -74.005974
      },
      deliveryLocation: {
        address: '456 Park Ave, New York, NY',
        latitude: 40.758896,
        longitude: -73.985130
      },
      packageDetails: {
        weight: 1.8,
        dimensions: { length: 30, width: 20, height: 15 },
        description: 'Laptop computer',
        value: 1200
      },
      status: 'delivered',
      priority: 'medium',
      assignedDrone: drone._id,
      assignedOperator: operator._id,
      deliveryFee: 39.99,
      estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      actualDeliveryTime: new Date(),
      trackingHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
        { status: 'assigned', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { status: 'picked_up', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
        { status: 'in_transit', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        { status: 'delivered', timestamp: new Date() }
      ]
    },
    {
      customer: customer._id,
      pickupLocation: {
        address: '789 Broadway, New York, NY',
        latitude: 40.730610,
        longitude: -73.935242
      },
      deliveryLocation: {
        address: '321 Fifth Ave, New York, NY',
        latitude: 40.753182,
        longitude: -73.982253
      },
      packageDetails: {
        weight: 0.7,
        dimensions: { length: 15, width: 10, height: 5 },
        description: 'Medical supplies',
        value: 150
      },
      status: 'in_transit',
      priority: 'high',
      assignedDrone: drone._id,
      assignedOperator: operator._id,
      deliveryFee: 29.99,
      estimatedDeliveryTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
      trackingHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { status: 'assigned', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
        { status: 'picked_up', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        { status: 'in_transit', timestamp: new Date(Date.now() - 15 * 60 * 1000) }
      ]
    },
    {
      customer: customer._id,
      pickupLocation: {
        address: '555 West St, New York, NY',
        latitude: 40.712775,
        longitude: -74.005973
      },
      deliveryLocation: {
        address: '777 East St, New York, NY',
        latitude: 40.758896,
        longitude: -73.985130
      },
      packageDetails: {
        weight: 1.2,
        dimensions: { length: 25, width: 15, height: 10 },
        description: 'Food delivery',
        value: 45
      },
      status: 'pending',
      priority: 'medium',
      deliveryFee: 19.99,
      estimatedDeliveryTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      trackingHistory: [
        { status: 'pending', timestamp: new Date() }
      ]
    }
  ];

  for (const orderData of orders) {
    const existingOrder = await Order.findOne({ 
      'pickupLocation.address': orderData.pickupLocation.address,
      customer: orderData.customer 
    });
    if (!existingOrder) {
      await Order.create(orderData);
      console.log(`Created order for ${orderData.pickupLocation.address}`);
    }
  }
};

const seedAssignments = async () => {
  console.log('Seeding assignments...');
  
  const operator = await User.findOne({ role: 'operator' });
  const drone = await Drone.findOne({ status: 'available' });
  const orders = await Order.find({ status: { $in: ['pending', 'assigned'] } }).limit(2);
  
  if (!operator || !drone || orders.length === 0) {
    console.log('Required data not found, skipping assignment seeding');
    return;
  }

  const assignment = {
    operator: operator._id,
    drone: drone._id,
    orders: orders.map(order => order._id),
    status: 'active',
    scheduledDate: new Date(),
    startTime: new Date(),
    route: orders.map((order, index) => ({
      order: order._id,
      sequence: index + 1,
      estimatedTime: new Date(Date.now() + (index + 1) * 60 * 60 * 1000),
      location: order.pickupLocation
    })),
    totalDistance: 15.5,
    estimatedDuration: 120,
    notes: 'Priority delivery route'
  };

  const existingAssignment = await Assignment.findOne({ 
    operator: operator._id,
    drone: drone._id,
    status: 'active'
  });
  
  if (!existingAssignment) {
    await Assignment.create(assignment);
    console.log('Created assignment for operator');
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data (optional)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Drone.deleteMany({});
    await Order.deleteMany({});
    await Assignment.deleteMany({});
    
    // Seed data
    await seedUsers();
    await seedDrones();
    await seedOrders();
    await seedAssignments();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
