const { MongoClient } = require('mongodb');
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

// Use different URIs for different environments
const uri = environment === 'production' 
  ? process.env.DATABASE_URL 
  : 'mongodb://localhost:27017/studybuddy-dev';

// Configure MongoDB client options based on environment
const clientOptions = environment === 'production' 
  ? {
      tls: true,
      tlsAllowInvalidCertificates: false,
    }
  : {
      // No TLS for local development
    };

const client = new MongoClient(uri, clientOptions);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    
    // Extract database name from URI or use environment-specific default
    const dbName = environment === 'production' ? 'studybuddy' : 'studybuddy-dev';
    db = client.db(dbName);
    
    console.log(`Connected to MongoDB (${environment}):`, db.databaseName);
    console.log('Database URI:', uri.replace(/\/\/.*@/, '//<credentials>@')); // Hide credentials in logs
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