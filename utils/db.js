// utils/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  tls: true, // Enable TLS
  tlsAllowInvalidCertificates: false, // Set to true if using self-signed certificates (not recommended)
  // You can also specify tlsCAFile if you have a specific CA certificate
  // tlsCAFile: '/path/to/ca.pem',
});

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(); // Use the default database specified in the URI
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
