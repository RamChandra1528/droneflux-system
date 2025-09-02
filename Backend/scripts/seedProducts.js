require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Sample products data
const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    category: "Electronics",
    brand: "TechSound",
    sku: "TS-WH-001",
    price: 89.99,
    comparePrice: 129.99,
    weight: 0.3,
    stock: {
      quantity: 50,
      lowStockThreshold: 10
    },
    images: [{
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      alt: "Wireless Bluetooth Headphones",
      isPrimary: true
    }],
    tags: ["wireless", "bluetooth", "headphones", "audio"],
    status: "active"
  },
  {
    name: "Smartphone Case - Clear",
    description: "Transparent protective case for smartphones with shock absorption technology.",
    category: "Electronics",
    brand: "ProtectPro",
    sku: "PP-SC-002",
    price: 19.99,
    comparePrice: 29.99,
    weight: 0.05,
    stock: {
      quantity: 100,
      lowStockThreshold: 20
    },
    images: [{
      url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500",
      alt: "Clear Smartphone Case",
      isPrimary: true
    }],
    tags: ["phone", "case", "protection", "clear"],
    status: "active"
  },
  {
    name: "Cotton T-Shirt - Blue",
    description: "Comfortable 100% cotton t-shirt in classic blue color. Perfect for casual wear.",
    category: "Clothing",
    brand: "ComfortWear",
    sku: "CW-TS-003",
    price: 24.99,
    weight: 0.2,
    stock: {
      quantity: 75,
      lowStockThreshold: 15
    },
    images: [{
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      alt: "Blue Cotton T-Shirt",
      isPrimary: true
    }],
    tags: ["cotton", "t-shirt", "casual", "blue"],
    status: "active"
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls and USB charging port.",
    category: "Home & Garden",
    brand: "BrightLight",
    sku: "BL-DL-004",
    price: 45.99,
    comparePrice: 65.99,
    weight: 0.8,
    stock: {
      quantity: 30,
      lowStockThreshold: 5
    },
    images: [{
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      alt: "LED Desk Lamp",
      isPrimary: true
    }],
    tags: ["led", "lamp", "desk", "lighting"],
    status: "active"
  },
  {
    name: "Fitness Tracker Watch",
    description: "Smart fitness tracker with heart rate monitoring, GPS, and 7-day battery life.",
    category: "Electronics",
    brand: "FitTech",
    sku: "FT-FW-005",
    price: 129.99,
    comparePrice: 179.99,
    weight: 0.1,
    stock: {
      quantity: 25,
      lowStockThreshold: 5
    },
    images: [{
      url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
      alt: "Fitness Tracker Watch",
      isPrimary: true
    }],
    tags: ["fitness", "tracker", "watch", "health"],
    status: "active"
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/droneflux');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} sample products`);

    // Display created products
    products.forEach(product => {
      console.log(`- ${product.name} (${product.sku}) - $${product.price}`);
    });

    console.log('\nSample products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
