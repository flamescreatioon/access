'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Create Access Tiers (expanded with pricing and limits)
    const tiers = [
      {
        name: 'Basic',
        permissions: JSON.stringify(['Standard Access', 'Coworking Space']),
        color: '#64748b',
        price: 29.00,
        max_booking_hours: 8,
        max_rooms: 1,
        priority_booking: false,
        peak_access: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Pro',
        permissions: JSON.stringify(['24/7 Access', 'Room Booking', 'Guest Passes', 'Equipment Access']),
        color: '#6366f1',
        price: 79.00,
        max_booking_hours: 24,
        max_rooms: 3,
        priority_booking: false,
        peak_access: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'VIP',
        permissions: JSON.stringify(['All Access', 'Priority Booking', 'Private Office', 'Equipment Priority', 'Event Hosting']),
        color: '#eab308',
        price: 149.00,
        max_booking_hours: -1,
        max_rooms: -1,
        priority_booking: true,
        peak_access: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Enterprise',
        permissions: JSON.stringify(['All Access', 'Dedicated Space', 'Team Management', 'Custom Hours', 'API Access']),
        color: '#ef4444',
        price: 299.00,
        max_booking_hours: -1,
        max_rooms: -1,
        priority_booking: true,
        peak_access: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Student Club',
        permissions: JSON.stringify(['Standard Access', 'Coworking Space', 'Student Benefits']),
        color: '#22c55e',
        price: 1500.00,
        max_booking_hours: 8,
        max_rooms: 1,
        priority_booking: false,
        peak_access: false,
        createdAt: now,
        updatedAt: now,
      },
    ];
    await queryInterface.bulkInsert('AccessTiers', tiers, {});

    // Get Tier IDs
    const tierRows = await queryInterface.sequelize.query(`SELECT id, name FROM "AccessTiers";`);
    const tierMap = {};
    tierRows[0].forEach(t => tierMap[t.name] = t.id);

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      {
        name: 'Admin User', email: 'admin@hub.com', password_hash: passwordHash, role: 'Admin',
        account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
        first_login_required: false, profile_complete: true, payment_status: 'NOT_REQUIRED',
        department: null, level: null,
        createdAt: now, updatedAt: now
      },
      {
        name: 'Hub Manager', email: 'manager@hub.com', password_hash: passwordHash, role: 'Hub Manager',
        account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
        first_login_required: false, profile_complete: true, payment_status: 'NOT_REQUIRED',
        department: null, level: null,
        createdAt: now, updatedAt: now
      },
      {
        name: 'Security Officer', email: 'security@hub.com', password_hash: passwordHash, role: 'Security',
        account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
        first_login_required: false, profile_complete: true, payment_status: 'NOT_REQUIRED',
        department: null, level: null,
        createdAt: now, updatedAt: now
      },
      {
        name: 'John Member', email: 'member@hub.com', password_hash: passwordHash, role: 'Student',
        account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
        first_login_required: false, profile_complete: true, payment_status: 'PAID',
        department: 'Computer Science', level: '300',
        createdAt: now, updatedAt: now
      },
      {
        name: 'New Invitee', email: 'new@hub.com', password_hash: passwordHash, role: null,
        account_status: 'INVITED', activation_status: 'INCOMPLETE', onboarding_status: 'NOT_STARTED',
        first_login_required: true, profile_complete: false, payment_status: 'NOT_REQUESTED',
        department: null, level: null,
        createdAt: now, updatedAt: now
      },
      {
        name: 'Jane Pro', email: 'pro@hub.com', password_hash: passwordHash, role: 'Student',
        account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
        first_login_required: false, profile_complete: true, payment_status: 'PAID',
        department: 'Electrical Engineering', level: '400',
        createdAt: now, updatedAt: now
      },
      {
        name: 'Alex VIP', email: 'vip@hub.com', password_hash: passwordHash, role: 'Student',
        account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
        first_login_required: false, profile_complete: true, payment_status: 'PAID',
        department: 'Mechanical Engineering', level: '500',
        createdAt: now, updatedAt: now
      },
      {
        name: 'Pending Student', email: 'pending@hub.com', password_hash: passwordHash, role: 'Student',
        account_status: 'INVITED', activation_status: 'PENDING_VERIFICATION', onboarding_status: 'AWAITING_VERIFICATION',
        first_login_required: true, profile_complete: true, payment_status: 'AWAITING_ADMIN_CONFIRMATION',
        department: 'Physics', level: '200', phone: '+234801234567',
        createdAt: now, updatedAt: now
      },
    ];
    await queryInterface.bulkInsert('Users', users, {});

    const userRows = await queryInterface.sequelize.query(`SELECT id, email FROM "Users";`);
    const userMap = {};
    userRows[0].forEach(u => userMap[u.email] = u.id);

    // 3. Create Memberships
    const memberships = [
      { user_id: userMap['member@hub.com'], tier_id: tierMap['Student Club'], status: 'Active', payment_status: 'PAID', expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
      { user_id: userMap['pro@hub.com'], tier_id: tierMap['Pro'], status: 'Active', payment_status: 'PAID', expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
      { user_id: userMap['vip@hub.com'], tier_id: tierMap['VIP'], status: 'Active', payment_status: 'PAID', expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
      { user_id: userMap['admin@hub.com'], tier_id: tierMap['VIP'], status: 'Active', payment_status: 'PAID', expiry_date: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('Memberships', memberships, {});

    // 4. Create Spaces
    const spaces = [
      { name: 'Cafe and lounge', description: 'Cozy lounge area with coffee and high-speed Wi-Fi.', type: 'coworking', capacity: 20, amenities: JSON.stringify(['Coffee', 'Wi-Fi', 'Lounge Chairs']), photos: JSON.stringify([]), rules: 'Keep noise levels moderate.', min_tier_id: tierMap['Basic'], hourly_rate: 0, max_booking_hours: 8, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
      { name: 'Server room', description: 'Secure climate-controlled server housing.', type: 'private_office', capacity: 2, amenities: JSON.stringify(['AC', 'Racks', 'Security']), photos: JSON.stringify([]), rules: 'Authorization required for entry.', min_tier_id: tierMap['VIP'], hourly_rate: 0, max_booking_hours: 2, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
      { name: 'Colab Room Left (Co-working space)', description: 'Spacious coworking area for collaborative work.', type: 'coworking', capacity: 15, amenities: JSON.stringify(['Wi-Fi', 'Hot Desks', 'Whiteboard']), photos: JSON.stringify([]), rules: 'Clean desk policy.', min_tier_id: tierMap['Basic'], hourly_rate: 0, max_booking_hours: 12, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
      { name: 'Design studio', description: 'Equipped with drawing tablets and high-end iMacs.', type: 'studio', capacity: 8, amenities: JSON.stringify(['Drawing Tablets', 'iMacs', 'Software Licenses']), photos: JSON.stringify([]), rules: 'Design software students only.', min_tier_id: tierMap['Pro'], hourly_rate: 0, max_booking_hours: 6, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
      { name: 'Rapid Prototype Studio', description: '3D printing and laser cutting lab.', type: 'lab', capacity: 10, amenities: JSON.stringify(['3D Printers', 'Laser Cutter', 'Basic Tools']), photos: JSON.stringify([]), rules: 'Safety orientation required.', min_tier_id: tierMap['Pro'], hourly_rate: 10, max_booking_hours: 4, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
      { name: 'Food and agritech lab', description: 'Specialized lab for agriculture and food technology research.', type: 'lab', capacity: 12, amenities: JSON.stringify(['Lab Benches', 'Sensors', 'Testing Kits']), photos: JSON.stringify([]), rules: 'PPE mandatory.', min_tier_id: tierMap['VIP'], hourly_rate: 0, max_booking_hours: 4, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
      { name: 'Tech Transfer Office', description: 'Administrative office for technology transfer.', type: 'private_office', capacity: 4, amenities: JSON.stringify(['Meeting Table', 'Storage', 'Secure Filing']), photos: JSON.stringify([]), rules: 'Confidentiality applies.', min_tier_id: tierMap['VIP'], hourly_rate: 0, max_booking_hours: 2, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
      { name: 'Pitch Garage', description: 'Large event space for pitches and presentations.', type: 'event_space', capacity: 40, amenities: JSON.stringify(['Stage', 'Projector', 'Power Outlets']), photos: JSON.stringify([]), rules: 'Booking required for events.', min_tier_id: tierMap['Basic'], hourly_rate: 50, max_booking_hours: 8, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
      { name: 'Colab Room Right(Co-working space)', description: 'Secondary coworking area for focused work.', type: 'coworking', capacity: 15, amenities: JSON.stringify(['Wi-Fi', 'Hot Desks', 'Quiet Zone']), photos: JSON.stringify([]), rules: 'Quiet zone.', min_tier_id: tierMap['Basic'], hourly_rate: 0, max_booking_hours: 12, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
      { name: 'Maker Studio(Wood workshop)', description: 'Fully equipped wood workshop.', type: 'lab', capacity: 8, amenities: JSON.stringify(['Saws', 'Workbenches', 'Dust Extraction']), photos: JSON.stringify([]), rules: 'Woodworking certification required.', min_tier_id: tierMap['Pro'], hourly_rate: 5, max_booking_hours: 4, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
      { name: 'Maker Studio(Metal Workshop)', description: 'Professional metal fabrication workshop.', type: 'lab', capacity: 8, amenities: JSON.stringify(['Welding', 'Lathe', 'Grinders']), photos: JSON.stringify([]), rules: 'Metalworking safety course required.', min_tier_id: tierMap['Pro'], hourly_rate: 5, max_booking_hours: 4, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
      { name: 'Creative Studio - Photography and videography studio', description: 'Pro-grade photography and video production space.', type: 'studio', capacity: 6, amenities: JSON.stringify(['Cameras', 'Lights', 'Green Screen']), photos: JSON.stringify([]), rules: 'Studio manager oversight required.', min_tier_id: tierMap['VIP'], hourly_rate: 20, max_booking_hours: 4, is_active: true, location: 'Second Floor', floor: '2', createdAt: now, updatedAt: now },
      { name: 'Creative Studio - Music studio', description: 'Soundproofed music recording and production studio.', type: 'studio', capacity: 4, amenities: JSON.stringify(['Instruments', 'DAW', 'Microphones']), photos: JSON.stringify([]), rules: 'High-volume allowed in booth.', min_tier_id: tierMap['VIP'], hourly_rate: 20, max_booking_hours: 6, is_active: true, location: 'Second Floor', floor: '2', createdAt: now, updatedAt: now },
      { name: 'Admin Office', description: 'Central administrative office for hub management.', type: 'private_office', capacity: 6, amenities: JSON.stringify(['Desks', 'Printer', 'Safe']), photos: JSON.stringify([]), rules: 'Staff only.', min_tier_id: tierMap['VIP'], hourly_rate: 0, max_booking_hours: 2, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('Spaces', spaces, {});

    // 5. Create Equipment
    const equipment = [
      {
        name: 'Creality Ender 3 V3',
        category: '3D Printer',
        description: 'Reliable FDM 3D printer for basic prototyping. Easy to use, suitable for PLA and PETG.',
        status: 'available',
        photo: '',
        safety_guidelines: 'Monitor the first layer. Do not touch the nozzle. Remove prints carefully.',
        requires_certification: true,
        certification_name: '3D Printing Basic',
        hourly_cost: 0,
        max_session_hours: 8,
        daily_limit_hours: 12,
        min_tier_id: tierMap['Basic'],
        location: 'Maker Lab, Bench 1',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Bambu Lab X1 Carbon',
        category: '3D Printer',
        description: 'High-speed professional 3D printer with multi-material support. Exceptional detail and reliability.',
        status: 'available',
        photo: '',
        safety_guidelines: 'Empty poop chute before use. Clean the build plate. Use provided OrcaSlicer profile.',
        requires_certification: true,
        certification_name: '3D Printing Basic',
        hourly_cost: 2,
        max_session_hours: 12,
        daily_limit_hours: 24,
        min_tier_id: tierMap['Pro'],
        location: 'Maker Lab, Bench 2',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Epilog Fusion Pro 32',
        category: 'Laser Cutter',
        description: 'Large-scale CO2 laser cutter for wood, acrylic, and leather. High precision engraving and cutting.',
        status: 'available',
        photo: '',
        safety_guidelines: 'Never leave the laser unattended while firing. Check exhaust is ON. Verify material compatibility.',
        requires_certification: true,
        certification_name: 'Laser Cutting Safety',
        hourly_cost: 5,
        max_session_hours: 2,
        daily_limit_hours: 4,
        min_tier_id: tierMap['Pro'],
        location: 'Maker Lab, Laser Room',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Weller WE1010 Soldering Station',
        category: 'Electronics',
        description: 'Digital soldering station with temperature control. Suitable for through-hole and SMD work.',
        status: 'available',
        photo: '',
        safety_guidelines: 'Always return iron to stand. Turn off when leaving. Work over heat-resistant mat.',
        requires_certification: false,
        hourly_cost: 0,
        max_session_hours: 4,
        daily_limit_hours: 8,
        min_tier_id: null,
        location: 'Maker Lab, Electronics Bench',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Meta Quest 3 (Unit 1)',
        category: 'VR/AR',
        description: 'Mixed reality headset for development and testing. 128GB model with Pro controllers.',
        status: 'available',
        photo: '',
        safety_guidelines: 'Define guardian boundary. Use wrist straps. Clean lenses only with microfiber cloth.',
        requires_certification: false,
        hourly_cost: 0,
        max_session_hours: 3,
        daily_limit_hours: 3,
        min_tier_id: tierMap['Pro'],
        location: 'Creative Studio',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Sony Alpha A7 IV',
        category: 'Media',
        description: 'Full-frame mirrorless camera for high-quality photography and 4K video recording.',
        status: 'available',
        photo: '',
        safety_guidelines: 'Keep sensor cover on when changing lenses. Use provided memory card or bring your own. Return to locked cabinet.',
        requires_certification: true,
        certification_name: 'Media Studio Orientation',
        hourly_cost: 10,
        max_session_hours: 4,
        daily_limit_hours: 4,
        min_tier_id: tierMap['VIP'],
        location: 'Creative Studio',
        createdAt: now, updatedAt: now,
      },
    ];
    await queryInterface.bulkInsert('Equipments', equipment, {});

    // 6. Create User Certifications
    const certifications = [
      {
        user_id: userMap['pro@hub.com'],
        certification_name: '3D Printing Basic',
        certified_at: now,
        expires_at: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        certified_by: userMap['manager@hub.com'],
        createdAt: now, updatedAt: now,
      },
      {
        user_id: userMap['vip@hub.com'],
        certification_name: '3D Printing Basic',
        certified_at: now,
        expires_at: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        certified_by: userMap['manager@hub.com'],
        createdAt: now, updatedAt: now,
      },
      {
        user_id: userMap['vip@hub.com'],
        certification_name: 'Laser Cutting Safety',
        certified_at: now,
        expires_at: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        certified_by: userMap['manager@hub.com'],
        createdAt: now, updatedAt: now,
      },
      {
        user_id: userMap['vip@hub.com'],
        certification_name: 'Media Studio Orientation',
        certified_at: now,
        expires_at: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        certified_by: userMap['manager@hub.com'],
        createdAt: now, updatedAt: now,
      },
    ];
    await queryInterface.bulkInsert('UserCertifications', certifications, {});

    // 7. Create Devices
    const devices = [
      { name: 'Main Entrance Scanner', type: 'Scanner', api_key: 'device_key_1', location: 'Lobby', createdAt: now, updatedAt: now },
      { name: 'Meeting Room Alpha Lock', type: 'Lock', api_key: 'device_key_2', location: 'Meeting Room Alpha', createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('Devices', devices, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserCertifications', null, {});
    await queryInterface.bulkDelete('Equipments', null, {});
    await queryInterface.bulkDelete('Bookings', null, {});
    await queryInterface.bulkDelete('Spaces', null, {});
    await queryInterface.bulkDelete('Memberships', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('AccessTiers', null, {});
    await queryInterface.bulkDelete('Devices', null, {});
  }
};
