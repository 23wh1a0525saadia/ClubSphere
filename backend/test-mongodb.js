// Save as: backend/test-mongodb.js
// Run: node backend/test-mongodb.js

const mongoose = require('mongoose');
require('dotenv').config();

const testMongoDB = async () => {
  console.log('\n🔍 MongoDB Connection Test\n');
  console.log('Testing MongoDB connection...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clubsphere');
    console.log('✅ MongoDB Connected Successfully!\n');
    
    // Get connection info
    const mongoStatus = mongoose.connection;
    console.log('📊 Connection Details:');
    console.log(`   Host: localhost`);
    console.log(`   Port: 27017`);
    console.log(`   Database: clubsphere`);
    console.log(`   State: ${mongoStatus.readyState === 1 ? '✅ Connected' : '❌ Not Connected'}\n`);
    
    // List collections
    const collections = await mongoStatus.db.listCollections().toArray();
    console.log('📋 Collections in Database:');
    collections.forEach(col => {
      console.log(`   ✓ ${col.name}`);
    });
    console.log('');
    
    // Get collection stats
    console.log('📈 Collection Stats:');
    for (const collection of collections) {
      const count = await mongoStatus.db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }
    console.log('');
    
    console.log('✅ All systems operational!\n');
    console.log('Your MongoDB is working perfectly with ClubSphere! 🎉\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!\n');
    console.error('Error:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('   1. MongoDB is running (mongod)');
    console.error('   2. Connection URI is correct in .env');
    console.error('   3. Port 27017 is accessible\n');
    process.exit(1);
  }
};

testMongoDB();
