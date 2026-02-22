'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // 1. Create Initial Admin User
        const passwordHash = await bcrypt.hash('password123', 10);
        const users = [
            {
                name: 'Admin User', email: 'admin@hub.com', password_hash: passwordHash, role: 'Admin',
                account_status: 'ACTIVE', activation_status: 'ACTIVE', onboarding_status: 'COMPLETED',
                first_login_required: false, profile_complete: true, payment_status: 'NOT_REQUIRED',
                department: null, level: null,
                createdAt: now, updatedAt: now
            }
        ];
        await queryInterface.bulkInsert('Users', users, {});

        // 2. Create Actual Spaces (No tier restrictions)
        const spaces = [
            { name: 'Cafe and lounge', description: 'Cozy lounge area with coffee and high-speed Wi-Fi.', type: 'coworking', capacity: 20, amenities: JSON.stringify(['Coffee', 'Wi-Fi', 'Lounge Chairs']), photos: JSON.stringify([]), rules: 'Keep noise levels moderate.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 8, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
            { name: 'Server room', description: 'Secure climate-controlled server housing.', type: 'private_office', capacity: 2, amenities: JSON.stringify(['AC', 'Racks', 'Security']), photos: JSON.stringify([]), rules: 'Authorization required for entry.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 2, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
            { name: 'Colab Room Left (Co-working space)', description: 'Spacious coworking area for collaborative work.', type: 'coworking', capacity: 15, amenities: JSON.stringify(['Wi-Fi', 'Hot Desks', 'Whiteboard']), photos: JSON.stringify([]), rules: 'Clean desk policy.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 12, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
            { name: 'Design studio', description: 'Equipped with drawing tablets and high-end iMacs.', type: 'studio', capacity: 8, amenities: JSON.stringify(['Drawing Tablets', 'iMacs', 'Software Licenses']), photos: JSON.stringify([]), rules: 'Design software students only.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 6, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
            { name: 'Rapid Prototype Studio', description: '3D printing and laser cutting lab.', type: 'lab', capacity: 10, amenities: JSON.stringify(['3D Printers', 'Laser Cutter', 'Basic Tools']), photos: JSON.stringify([]), rules: 'Safety orientation required.', min_tier_id: null, hourly_rate: 10, max_booking_hours: 4, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
            { name: 'Food and agritech lab', description: 'Specialized lab for agriculture and food technology research.', type: 'lab', capacity: 12, amenities: JSON.stringify(['Lab Benches', 'Sensors', 'Testing Kits']), photos: JSON.stringify([]), rules: 'PPE mandatory.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 4, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
            { name: 'Tech Transfer Office', description: 'Administrative office for technology transfer.', type: 'private_office', capacity: 4, amenities: JSON.stringify(['Meeting Table', 'Storage', 'Secure Filing']), photos: JSON.stringify([]), rules: 'Confidentiality applies.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 2, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
            { name: 'Pitch Garage', description: 'Large event space for pitches and presentations.', type: 'event_space', capacity: 40, amenities: JSON.stringify(['Stage', 'Projector', 'Power Outlets']), photos: JSON.stringify([]), rules: 'Booking required for events.', min_tier_id: null, hourly_rate: 50, max_booking_hours: 8, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
            { name: 'Colab Room Right(Co-working space)', description: 'Secondary coworking area for focused work.', type: 'coworking', capacity: 15, amenities: JSON.stringify(['Wi-Fi', 'Hot Desks', 'Quiet Zone']), photos: JSON.stringify([]), rules: 'Quiet zone.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 12, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
            { name: 'Maker Studio(Wood workshop)', description: 'Fully equipped wood workshop.', type: 'lab', capacity: 8, amenities: JSON.stringify(['Saws', 'Workbenches', 'Dust Extraction']), photos: JSON.stringify([]), rules: 'Woodworking certification required.', min_tier_id: null, hourly_rate: 5, max_booking_hours: 4, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
            { name: 'Maker Studio(Metal Workshop)', description: 'Professional metal fabrication workshop.', type: 'lab', capacity: 8, amenities: JSON.stringify(['Welding', 'Lathe', 'Grinders']), photos: JSON.stringify([]), rules: 'Metalworking safety course required.', min_tier_id: null, hourly_rate: 5, max_booking_hours: 4, is_active: true, location: 'Ground Floor', floor: '0', createdAt: now, updatedAt: now },
            { name: 'Creative Studio - Photography and videography studio', description: 'Pro-grade photography and video production space.', type: 'studio', capacity: 6, amenities: JSON.stringify(['Cameras', 'Lights', 'Green Screen']), photos: JSON.stringify([]), rules: 'Studio manager oversight required.', min_tier_id: null, hourly_rate: 20, max_booking_hours: 4, is_active: true, location: 'Second Floor', floor: '2', createdAt: now, updatedAt: now },
            { name: 'Creative Studio - Music studio', description: 'Soundproofed music recording and production studio.', type: 'studio', capacity: 4, amenities: JSON.stringify(['Instruments', 'DAW', 'Microphones']), photos: JSON.stringify([]), rules: 'High-volume allowed in booth.', min_tier_id: null, hourly_rate: 20, max_booking_hours: 6, is_active: true, location: 'Second Floor', floor: '2', createdAt: now, updatedAt: now },
            { name: 'Admin Office', description: 'Central administrative office for hub management.', type: 'private_office', capacity: 6, amenities: JSON.stringify(['Desks', 'Printer', 'Safe']), photos: JSON.stringify([]), rules: 'Staff only.', min_tier_id: null, hourly_rate: 0, max_booking_hours: 2, is_active: true, location: 'First Floor', floor: '1', createdAt: now, updatedAt: now },
        ];
        await queryInterface.bulkInsert('Spaces', spaces, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Spaces', null, {});
        await queryInterface.bulkDelete('Users', null, {});
        await queryInterface.bulkDelete('AccessTiers', null, {});
    }
};
