/* global use, db */
// MongoDB Playground - Seed Test Clubs

const database = 'clubsphere';
use(database);

// Insert test clubs
db.clubs.insertMany([
  {
    name: 'NSS (National Service Scheme)',
    description: 'National Service Scheme - Social welfare and community service',
    category: 'Social',
    email: 'nss@college.edu',
    president: null,
    members: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Synergia - Tech Fest',
    description: 'Annual technology festival showcasing innovation and talent',
    category: 'Technical',
    email: 'synergia@college.edu',
    president: null,
    members: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Cultural Club',
    description: 'Promoting arts, music, dance, and cultural activities',
    category: 'Cultural',
    email: 'cultural@college.edu',
    president: null,
    members: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Coding Club',
    description: 'Programming, web development, and competitive coding',
    category: 'Technical',
    email: 'coding@college.edu',
    president: null,
    members: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sports Club',
    description: 'Indoor and outdoor sports activities and tournaments',
    category: 'Sports',
    email: 'sports@college.edu',
    president: null,
    members: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

console.log('Test clubs inserted successfully!');
