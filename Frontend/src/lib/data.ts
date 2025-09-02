
// Types
export interface User {
  _id?: string; // from mongodb
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'operator' | 'staff';
  avatar: string;
}

export interface Drone {
  id: string;
  name: string;
  model: string;
  status: 'available' | 'in-transit' | 'charging' | 'maintenance';
  batteryLevel: number;
  location: {
    lat: number;
    lng: number;
  };
  maxPayload: number; // in kg
  range: number; // in km
  speed: number; // in km/h
}

export interface Order {
  id?: string;
  _id?: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'processing' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  actualDeliveryTime?: string;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  items: {
    name: string;
    quantity: number;
    weight: number;
  }[];
  totalWeight: number;
  droneId?: string;
  droneName?: string;
  operatorId?: string;
  operatorName?: string;
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  price: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  trackingHistory?: Array<{
    status: string;
    timestamp: string;
    location?: {
      lat: number;
      lng: number;
    };
    notes?: string;
  }>;
}

// Mock data
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@droneflux.com",
    role: "admin",
    avatar: "/placeholder.svg",
  },
  {
    id: "u2",
    name: "John Customer",
    email: "john@example.com",
    role: "customer",
    avatar: "/placeholder.svg",
  },
  {
    id: "u3",
    name: "Mike Operator",
    email: "mike@droneflux.com",
    role: "operator",
    avatar: "/placeholder.svg",
  },
  {
    id: "u4",
    name: "Sarah Staff",
    email: "sarah@droneflux.com",
    role: "staff",
    avatar: "/placeholder.svg",
  },
];

export const mockDrones: Drone[] = [
  {
    id: "d1",
    name: "Falcon-X1",
    model: "DJI Mavic 3",
    status: "available",
    batteryLevel: 98,
    location: {
      lat: 40.712776,
      lng: -74.005974,
    },
    maxPayload: 2.5,
    range: 30,
    speed: 65,
  },
  {
    id: "d2",
    name: "Swift-D2",
    model: "Skydio 2",
    status: "in-transit",
    batteryLevel: 72,
    location: {
      lat: 40.730610,
      lng: -73.935242,
    },
    maxPayload: 1.8,
    range: 25,
    speed: 58,
  },
  {
    id: "d3",
    name: "HeavyLift-H1",
    model: "FreeFly Alta X",
    status: "maintenance",
    batteryLevel: 45,
    location: {
      lat: 40.758896,
      lng: -73.985130,
    },
    maxPayload: 5.0,
    range: 20,
    speed: 45,
  },
  {
    id: "d4",
    name: "NimbleBot-N1",
    model: "Autel EVO II",
    status: "charging",
    batteryLevel: 22,
    location: {
      lat: 40.712775,
      lng: -74.005973,
    },
    maxPayload: 2.0,
    range: 28,
    speed: 72,
  },
  {
    id: "d5",
    name: "DeliveryPro-P3",
    model: "DJI Matrice 300",
    status: "available",
    batteryLevel: 87,
    location: {
      lat: 40.753182,
      lng: -73.982253,
    },
    maxPayload: 4.5,
    range: 35,
    speed: 55,
  },
];

export const mockOrders: Order[] = [
  {
    id: "o1",
    customerId: "u2",
    customerName: "John Customer",
    status: "delivered",
    createdAt: "2023-10-10T12:00:00Z",
    estimatedDelivery: "2023-10-10T14:00:00Z",
    pickupLocation: {
      address: "123 Broadway, New York, NY",
      lat: 40.712776,
      lng: -74.005974,
    },
    deliveryLocation: {
      address: "456 Park Ave, New York, NY",
      lat: 40.758896,
      lng: -73.985130,
    },
    items: [
      {
        name: "Laptop",
        quantity: 1,
        weight: 1.8,
      },
    ],
    totalWeight: 1.8,
    droneId: "d1",
    droneName: "Falcon-X1",
    operatorId: "u3",
    operatorName: "Mike Operator",
    deliveryStaffId: "u4",
    deliveryStaffName: "Sarah Staff",
    price: 39.99,
    paymentStatus: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "o2",
    customerId: "u2",
    customerName: "John Customer",
    status: "in-transit",
    createdAt: "2023-10-11T09:30:00Z",
    estimatedDelivery: "2023-10-11T11:30:00Z",
    pickupLocation: {
      address: "789 Broadway, New York, NY",
      lat: 40.730610,
      lng: -73.935242,
    },
    deliveryLocation: {
      address: "321 Fifth Ave, New York, NY",
      lat: 40.753182,
      lng: -73.982253,
    },
    items: [
      {
        name: "Medication",
        quantity: 3,
        weight: 0.2,
      },
      {
        name: "Documents",
        quantity: 1,
        weight: 0.5,
      },
    ],
    totalWeight: 1.1,
    droneId: "d2",
    droneName: "Swift-D2",
    operatorId: "u3",
    operatorName: "Mike Operator",
    price: 29.99,
    paymentStatus: "completed",
    paymentMethod: "PayPal",
  },
  {
    id: "o3",
    customerId: "u2",
    customerName: "John Customer",
    status: "pending",
    createdAt: "2023-10-11T15:45:00Z",
    estimatedDelivery: "2023-10-11T17:45:00Z",
    pickupLocation: {
      address: "555 West St, New York, NY",
      lat: 40.712775,
      lng: -74.005973,
    },
    deliveryLocation: {
      address: "777 East St, New York, NY",
      lat: 40.758896,
      lng: -73.985130,
    },
    items: [
      {
        name: "Food Order",
        quantity: 2,
        weight: 1.2,
      },
    ],
    totalWeight: 1.2,
    price: 19.99,
    paymentStatus: "pending",
  },
  {
    id: "o4",
    customerId: "u2",
    customerName: "John Customer",
    status: "processing",
    createdAt: "2023-10-12T10:00:00Z",
    estimatedDelivery: "2023-10-12T12:00:00Z",
    pickupLocation: {
      address: "222 North St, New York, NY",
      lat: 40.753182,
      lng: -73.982253,
    },
    deliveryLocation: {
      address: "444 South St, New York, NY",
      lat: 40.730610,
      lng: -73.935242,
    },
    items: [
      {
        name: "Electronics",
        quantity: 1,
        weight: 2.8,
      },
    ],
    totalWeight: 2.8,
    droneId: "d5",
    droneName: "DeliveryPro-P3",
    operatorId: "u3",
    operatorName: "Mike Operator",
    price: 49.99,
    paymentStatus: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "o5",
    customerId: "u2",
    customerName: "John Customer",
    status: "cancelled",
    createdAt: "2023-10-09T14:20:00Z",
    estimatedDelivery: "2023-10-09T16:20:00Z",
    pickupLocation: {
      address: "888 Central Ave, New York, NY",
      lat: 40.712776,
      lng: -74.005974,
    },
    deliveryLocation: {
      address: "999 Main St, New York, NY",
      lat: 40.758896,
      lng: -73.985130,
    },
    items: [
      {
        name: "Gift Box",
        quantity: 1,
        weight: 1.5,
      },
    ],
    totalWeight: 1.5,
    price: 34.99,
    paymentStatus: "failed",
  },
];

// Dashboard statistics
export const droneStats = {
  total: 5,
  available: 2,
  inTransit: 1,
  charging: 1,
  maintenance: 1,
};

export const orderStats = {
  today: 3,
  pending: 1,
  processing: 1,
  inTransit: 1,
  delivered: 1,
  cancelled: 1,
  totalRevenue: 139.96,
};

export const deliveryPerformance = {
  avgDeliveryTime: 85, // minutes
  onTimeDelivery: 92, // percentage
  customerSatisfaction: 4.7, // out of 5
  failedDeliveries: 3, // percentage
};

// Weekly order data for charts
export const weeklyOrders = [
  { name: "Mon", orders: 12 },
  { name: "Tue", orders: 16 },
  { name: "Wed", orders: 15 },
  { name: "Thu", orders: 18 },
  { name: "Fri", orders: 24 },
  { name: "Sat", orders: 28 },
  { name: "Sun", orders: 22 },
];

// Monthly revenue data for charts
export const monthlyRevenue = [
  { name: "Jan", revenue: 4500 },
  { name: "Feb", revenue: 5200 },
  { name: "Mar", revenue: 6100 },
  { name: "Apr", revenue: 5800 },
  { name: "May", revenue: 7200 },
  { name: "Jun", revenue: 8500 },
  { name: "Jul", revenue: 9200 },
  { name: "Aug", revenue: 9800 },
  { name: "Sep", revenue: 10500 },
  { name: "Oct", revenue: 11200 },
  { name: "Nov", revenue: 0 },
  { name: "Dec", revenue: 0 },
];

// Mock login function
export const mockLogin = (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user && password.length >= 6) {
        resolve(user);
      } else {
        resolve(null);
      }
    }, 800);
  });
};
