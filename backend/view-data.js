// Save as: backend/view-data.js
// Run: node backend/view-data.js
// This shows what's in your MongoDB database

const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Club = require('./models/Club');
const Registration = require('./models/Registration');
require('dotenv').config();

const viewData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clubsphere');
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║           📊 CLUBSPHERE DATABASE CONTENT                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    // Users
    console.log('👥 USERS:');
    const users = await User.find();
    if (users.length > 0) {
      users.forEach((user, i) => {
        console.log(`\n   User ${i+1}:`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Dept: ${user.department}`);
        console.log(`   - Semester: ${user.semester}`);
      });
    } else {
      console.log('   (No users yet)');
    }
    
    // Events
    console.log('\n\n🎭 EVENTS:');
    const events = await Event.find();
    if (events.length > 0) {
      events.forEach((event, i) => {
        console.log(`\n   Event ${i+1}:`);
        console.log(`   - Title: ${event.title}`);
        console.log(`   - Type: ${event.eventType}`);
        console.log(`   - Location: ${event.location}`);
        console.log(`   - Capacity: ${event.capacity}`);
        console.log(`   - Date: ${event.startDate?.toLocaleDateString()}`);
        console.log(`   - Time: ${event.startTime} - ${event.endTime}`);
      });
    } else {
      console.log('   (No events yet)');
    }
    
    // Clubs
    console.log('\n\n🏢 CLUBS:');
    const clubs = await Club.find();
    if (clubs.length > 0) {
      clubs.forEach((club, i) => {
        console.log(`\n   Club ${i+1}:`);
        console.log(`   - Name: ${club.name}`);
        console.log(`   - Category: ${club.category}`);
        console.log(`   - Members: ${club.members?.length || 0}`);
      });
    } else {
      console.log('   (No clubs yet)');
    }
    
    // Registrations
    console.log('\n\n📋 REGISTRATIONS:');
    const registrations = await Registration.find();
    if (registrations.length > 0) {
      registrations.forEach((reg, i) => {
        console.log(`\n   Registration ${i+1}:`);
        console.log(`   - Student ID: ${reg.student}`);
        console.log(`   - Event ID: ${reg.event}`);
        console.log(`   - Date: ${reg.registeredAt?.toLocaleDateString()}`);
        console.log(`   - Attendance: ${reg.attendance || 'pending'}`);
      });
    } else {
      console.log('   (No registrations yet)');
    }
    
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
    console.log(`║  Total Users: ${users.length.toString().padEnd(48)}║`);
    console.log(`║  Total Events: ${events.length.toString().padEnd(47)}║`);
    console.log(`║  Total Clubs: ${clubs.length.toString().padEnd(48)}║`);
    console.log(`║  Total Registrations: ${registrations.length.toString().padEnd(39)}║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

viewData();
