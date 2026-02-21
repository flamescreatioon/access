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
    ];
    await queryInterface.bulkInsert('AccessTiers', tiers, {});

    // Get Tier IDs
    const tierRows = await queryInterface.sequelize.query(`SELECT id, name FROM "AccessTiers";`);
    const tierMap = {};
    tierRows[0].forEach(t => tierMap[t.name] = t.id);

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      { name: 'Admin User', email: 'admin@hub.com', password_hash: passwordHash, role: 'Admin', createdAt: now, updatedAt: now },
      { name: 'Hub Manager', email: 'manager@hub.com', password_hash: passwordHash, role: 'Hub Manager', createdAt: now, updatedAt: now },
      { name: 'Security Officer', email: 'security@hub.com', password_hash: passwordHash, role: 'Security', createdAt: now, updatedAt: now },
      { name: 'John Member', email: 'member@hub.com', password_hash: passwordHash, role: 'Member', createdAt: now, updatedAt: now },
      { name: 'Jane Pro', email: 'pro@hub.com', password_hash: passwordHash, role: 'Member', createdAt: now, updatedAt: now },
      { name: 'Alex VIP', email: 'vip@hub.com', password_hash: passwordHash, role: 'Member', createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('Users', users, {});

    const userRows = await queryInterface.sequelize.query(`SELECT id, email FROM "Users";`);
    const userMap = {};
    userRows[0].forEach(u => userMap[u.email] = u.id);

    // 3. Create Memberships
    const memberships = [
      { user_id: userMap['member@hub.com'], tier_id: tierMap['Basic'], status: 'Active', expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
      { user_id: userMap['pro@hub.com'], tier_id: tierMap['Pro'], status: 'Active', expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
      { user_id: userMap['vip@hub.com'], tier_id: tierMap['VIP'], status: 'Active', expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
      { user_id: userMap['admin@hub.com'], tier_id: tierMap['VIP'], status: 'Active', expiry_date: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()), createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('Memberships', memberships, {});

    // 4. Create Spaces
    const spaces = [
      {
        name: 'Focus Pod A',
        description: 'A quiet, private pod for focused work. Sound-insulated with ergonomic seating and desk. Perfect for deep work sessions or private calls.',
        type: 'private_office',
        capacity: 1,
        amenities: JSON.stringify(['Wi-Fi', 'Power Outlet', 'Monitor', 'Webcam', 'Sound Insulation']),
        photos: JSON.stringify([]),
        rules: 'Max 4-hour sessions. Clean desk policy. No food.',
        min_tier_id: tierMap['Basic'],
        hourly_rate: 0,
        max_booking_hours: 4,
        is_active: true,
        location: 'Ground Floor',
        floor: 'G',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Meeting Room Alpha',
        description: 'Standard meeting room with presentation display, whiteboard, and video conferencing setup. Ideal for team standups and client calls.',
        type: 'meeting_room',
        capacity: 6,
        amenities: JSON.stringify(['Wi-Fi', 'TV Display', 'Whiteboard', 'HDMI Cable', 'Webcam', 'Speaker']),
        photos: JSON.stringify([]),
        rules: 'Book at least 2 hours in advance. Clean up after use.',
        min_tier_id: tierMap['Basic'],
        hourly_rate: 5,
        max_booking_hours: 3,
        is_active: true,
        location: '1st Floor, East Wing',
        floor: '1',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Meeting Room Beta',
        description: 'Premium meeting room with 65" interactive display, surround sound, and executive furniture. Great for pitches and board meetings.',
        type: 'meeting_room',
        capacity: 12,
        amenities: JSON.stringify(['Wi-Fi', '65" Interactive Display', 'Surround Sound', 'Video Conference', 'Whiteboard', 'Mini Fridge']),
        photos: JSON.stringify([]),
        rules: 'Pro tier and above. Must end meetings on time.',
        min_tier_id: tierMap['Pro'],
        hourly_rate: 15,
        max_booking_hours: 4,
        is_active: true,
        location: '2nd Floor, West Wing',
        floor: '2',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Open Coworking Space',
        description: 'Large open floor coworking area with hot desks, standing desks, and lounge seating. High-speed Wi-Fi and plenty of power outlets.',
        type: 'coworking',
        capacity: 40,
        amenities: JSON.stringify(['Wi-Fi', 'Hot Desks', 'Standing Desks', 'Lounge Area', 'Power Outlets', 'Coffee Station']),
        photos: JSON.stringify([]),
        rules: 'First come first served for unbooked desks. Noise level moderate.',
        min_tier_id: null,
        hourly_rate: 0,
        max_booking_hours: 8,
        is_active: true,
        location: 'Ground Floor',
        floor: 'G',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Creative Studio',
        description: 'Multimedia production studio with green screen, professional lighting rigs, and audio recording booth. Full equipment list available on request.',
        type: 'studio',
        capacity: 4,
        amenities: JSON.stringify(['Green Screen', 'Ring Lights', 'DSLR Camera', 'Audio Booth', 'Editing Station', 'Backdrop Kit']),
        photos: JSON.stringify([]),
        rules: 'Must complete media equipment orientation. VIP tier required. Handle equipment with care.',
        min_tier_id: tierMap['VIP'],
        hourly_rate: 25,
        max_booking_hours: 6,
        is_active: true,
        location: '2nd Floor, Media Wing',
        floor: '2',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Maker Lab',
        description: 'Fully-equipped fabrication lab with 3D printers, laser cutter, CNC router, and electronics workbench. Certification required for some equipment.',
        type: 'lab',
        capacity: 8,
        amenities: JSON.stringify(['3D Printers', 'Laser Cutter', 'CNC Router', 'Soldering Stations', 'Electronics Bench', 'Safety Gear']),
        photos: JSON.stringify([]),
        rules: 'Safety orientation mandatory. PPE required. Clean up workspace after every session.',
        min_tier_id: tierMap['Pro'],
        hourly_rate: 10,
        max_booking_hours: 4,
        is_active: true,
        location: 'Basement, Workshop Area',
        floor: 'B1',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Event Space',
        description: 'Large event hall with modular seating, stage area, projector, and PA system. Suitable for workshops, talks, and networking events up to 80 attendees.',
        type: 'event_space',
        capacity: 80,
        amenities: JSON.stringify(['Projector', 'PA System', 'Stage', 'Modular Seating', 'Microphones', 'Streaming Setup']),
        photos: JSON.stringify([]),
        rules: 'Must book at least 48hrs in advance. Event coordinator approval required for 50+ attendees.',
        min_tier_id: tierMap['VIP'],
        hourly_rate: 50,
        max_booking_hours: 8,
        is_active: true,
        location: '3rd Floor',
        floor: '3',
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Phone Booth 1',
        description: 'Sound-proof phone booth for private calls and quick video meetings. Standing desk with monitor.',
        type: 'private_office',
        capacity: 1,
        amenities: JSON.stringify(['Wi-Fi', 'Monitor', 'Sound Insulation', 'Standing Desk']),
        photos: JSON.stringify([]),
        rules: 'Max 1-hour sessions. No eating.',
        min_tier_id: null,
        hourly_rate: 0,
        max_booking_hours: 1,
        is_active: true,
        location: '1st Floor, Corridor',
        floor: '1',
        createdAt: now, updatedAt: now,
      },
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
