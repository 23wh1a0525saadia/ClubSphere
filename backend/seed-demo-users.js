const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const demoUsers = [
  {
    name: 'Demo Admin',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    registrationNumber: 'ADMIN001',
    department: 'CSE',
    semester: 1
  },
  {
    name: 'Demo Student',
    email: 'student@college.edu',
    password: 'student123',
    role: 'student',
    registrationNumber: 'STUDENT001',
    department: 'CSE',
    semester: 1
  }
];

const upsertDemoUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email }).select('+password');

  if (!existingUser) {
    await User.create(userData);
    console.log(`Created user: ${userData.email}`);
    return;
  }

  existingUser.name = userData.name;
  existingUser.password = userData.password;
  existingUser.role = userData.role;
  existingUser.registrationNumber = userData.registrationNumber;
  existingUser.department = userData.department;
  existingUser.semester = userData.semester;
  await existingUser.save();
  console.log(`Updated user: ${userData.email}`);
};

const seedDemoUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    for (const userData of demoUsers) {
      await upsertDemoUser(userData);
    }

    console.log('Demo users are ready.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo users:', error.message);
    process.exit(1);
  }
};

seedDemoUsers();
