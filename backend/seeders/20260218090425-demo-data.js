'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Create Access Tiers
    const tiers = [
      { name: 'Basic', permissions: JSON.stringify(['Standard Access']), createdAt: now, updatedAt: now },
      { name: 'Pro', permissions: JSON.stringify(['24/7 Access', 'Room Booking', 'Guest Passes']), createdAt: now, updatedAt: now },
      { name: 'VIP', permissions: JSON.stringify(['All Access', 'Priority Booking', 'Private Office']), createdAt: now, updatedAt: now }
    ];
    await queryInterface.bulkInsert('AccessTiers', tiers, {});

    // Get Tier IDs
    const tierRows = await queryInterface.sequelize.query(
      `SELECT id, name FROM "AccessTiers";`
    );
    const tierMap = {};
    tierRows[0].forEach(t => tierMap[t.name] = t.id);

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      {
        name: 'Admin User',
        email: 'admin@hub.com',
        password_hash: passwordHash,
        role: 'Admin',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Hub Manager',
        email: 'manager@hub.com',
        password_hash: passwordHash,
        role: 'Hub Manager',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Security Officer',
        email: 'security@hub.com',
        password_hash: passwordHash,
        role: 'Security',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'John Member',
        email: 'member@hub.com',
        password_hash: passwordHash,
        role: 'Member',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Jane Pro',
        email: 'pro@hub.com',
        password_hash: passwordHash,
        role: 'Member',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});

    // Get User IDs
    const userRows = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users";`
    );
    const userMap = {};
    userRows[0].forEach(u => userMap[u.email] = u.id);

    // 3. Create Memberships
    const memberships = [
      {
        user_id: userMap['member@hub.com'],
        tier_id: tierMap['Basic'],
        status: 'Active',
        expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: userMap['pro@hub.com'],
        tier_id: tierMap['Pro'],
        status: 'Active',
        expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        createdAt: now,
        updatedAt: now
      },
      // Admin/Manager also get memberships for access testing
      {
        user_id: userMap['admin@hub.com'],
        tier_id: tierMap['VIP'],
        status: 'Active',
        expiry_date: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()),
        createdAt: now,
        updatedAt: now
      }
    ];
    await queryInterface.bulkInsert('Memberships', memberships, {});

    // 4. Create Rooms
    // Check if Rooms table exists first (it wasn't in my plan, but Booking model references resource_id. 
    // Wait, I didn't create a Resource/Room model in backend, just Booking. 
    // In backend/models/booking.js, resource_id is just an integer. The frontend has mock data for rooms.
    // So for now, backend booking just stores an ID. I won't seed Rooms table if it doesn't exist.
    // Checking my plan... "Booking Model: id, user_id, resource_id...". No Room/Resource model.
    // Correct, resource_id is loosely coupled for this MVP or I should add it?
    // User asked for "default users", so I will stick to Users/Tiers/Memberships.

    // 5. Create Devices
    const devices = [
      {
        name: 'Main Entrance Scanner',
        type: 'Scanner',
        api_key: 'device_key_1',
        location: 'Lobby',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Meeting Room A Lock',
        type: 'Lock',
        api_key: 'device_key_2',
        location: 'Meeting Room A',
        createdAt: now,
        updatedAt: now
      }
    ];
    await queryInterface.bulkInsert('Devices', devices, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Memberships', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('AccessTiers', null, {});
    await queryInterface.bulkDelete('Devices', null, {});
  }
};
