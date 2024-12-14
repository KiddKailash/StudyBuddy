const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    db = client.db('studybuddy');
    console.log('Connected to MongoDB using database:', db.databaseName);
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
