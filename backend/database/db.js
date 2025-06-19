/**
 * Database Connection Module
 * 
 * Manages MongoDB database connections and provides database access utilities.
 * Handles environment-specific configuration for development and production.
 * Implements connection pooling and error handling for database operations.
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Determine current environment with fallback to development
const environment = process.env.NODE_ENV || 'development';

// Configure database URI based on environment
// Production uses DATABASE_URL from environment variables
// Development uses local MongoDB instance
const uri = environment === 'production' 
  ? process.env.DATABASE_URL 
  : process.env.DATABASE_URL_DEV;

// Configure MongoDB client options with environment-specific settings
// Production requires TLS for secure connections
// Development uses default settings without TLS
const clientOptions = environment === 'production' 
  ? {
      tls: true, // Enable TLS for production security
      tlsAllowInvalidCertificates: false, // Require valid certificates
    }
  : {
      // No TLS configuration for local development
    };

// Create MongoDB client instance with configured options
const client = new MongoClient(uri, clientOptions);

// Global database instance for connection reuse
let db;

/**
 * Establishes connection to MongoDB database
 * 
 * Creates and maintains a connection to the MongoDB database based on
 * the current environment. Implements connection pooling and reuse.
 * Handles environment-specific database naming and security configurations.
 * 
 * Process Flow:
 * 1. Checks if connection already exists (connection reuse)
 * 2. Establishes connection to MongoDB using configured client
 * 3. Extracts or determines database name based on environment
 * 4. Sets up database instance with proper naming
 * 5. Logs connection success with masked credentials
 * 
 * @returns {Promise<Object>} MongoDB database instance
 * @throws {Error} If connection fails or database initialization error occurs
 */
const connectDB = async () => {
  // Return existing connection if already established (connection pooling)
  if (db) return db;
  
  try {
    // Establish connection to MongoDB server
    await client.connect();
    
    // Determine database name based on environment
    // Production uses 'studybuddy', development uses 'studybuddy-dev'
    const dbName = environment === 'production' ? 'studybuddy' : 'studybuddy-dev';
    db = client.db(dbName);
    
    // Log successful connection with environment and database name
    console.log(`Connected to MongoDB (${environment}):`, db.databaseName);
    
    // Log connection URI with credentials masked for security
    // Replaces credentials in URI with placeholder for logging
    console.log('Database URI:', uri.replace(/\/\/.*@/, '//<credentials>@'));
    
    return db;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
};

/**
 * Retrieves the active database instance
 * 
 * Returns the currently connected database instance. Ensures that
 * the database has been properly initialized before allowing access.
 * Used by controllers and other modules to access database collections.
 * 
 * @returns {Object} MongoDB database instance
 * @throws {Error} If database has not been initialized (connectDB not called)
 */
const getDB = () => {
  // Validate that database connection has been established
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

// Export functions for use in other modules
module.exports = { connectDB, getDB };