// Mock data generators and constants for the Uacess PWA (Unipod)

export const ROLES = {
    MEMBER: 'Member',
    ADMIN: 'Admin',
    HUB_MANAGER: 'Hub Manager',
    SECURITY: 'Security',
    INSTRUCTOR: 'Instructor',
};

export const MEMBERSHIP_TIERS = [
    { id: 'basic', name: 'Basic', color: '#64748b', price: 29, maxBookingHours: 4, maxRooms: 1 },
    { id: 'pro', name: 'Professional', color: '#22c55e', price: 79, maxBookingHours: 12, maxRooms: 3 },
    { id: 'enterprise', name: 'Enterprise', color: '#f97316', price: 199, maxBookingHours: 40, maxRooms: 10 },
    { id: 'vip', name: 'VIP', color: '#eab308', price: 499, maxBookingHours: -1, maxRooms: -1 },
];

export const ROOMS = [
    { id: 'r1', name: 'Cafe and lounge', capacity: 20, floor: 0, amenities: ['Coffee', 'Wi-Fi', 'Lounge Chairs'], image: '', hourly_rate: 0 },
    { id: 'r2', name: 'Server room', capacity: 2, floor: 0, amenities: ['AC', 'Racks', 'Security'], image: '', hourly_rate: 0 },
    { id: 'r3', name: 'Colab Room Left (Co-working space)', capacity: 15, floor: 1, amenities: ['Wi-Fi', 'Hot Desks'], image: '', hourly_rate: 0 },
    { id: 'r4', name: 'Design studio', capacity: 8, floor: 1, amenities: ['Drawing Tablets', 'iMacs'], image: '', hourly_rate: 0 },
    { id: 'r5', name: 'Rapid Prototype Studio', capacity: 10, floor: 1, amenities: ['3D Printers', 'Laser Cutter'], image: '', hourly_rate: 0 },
    { id: 'r6', name: 'Food and agritech lab', capacity: 12, floor: 0, amenities: ['Lab Benches', 'Sensors'], image: '', hourly_rate: 0 },
    { id: 'r7', name: 'Tech Transfer Office', capacity: 4, floor: 1, amenities: ['Meeting Table', 'Storage'], image: '', hourly_rate: 0 },
    { id: 'r8', name: 'Pitch Garage', capacity: 40, floor: 0, amenities: ['Stage', 'Projector', 'Sound System'], image: '', hourly_rate: 0 },
    { id: 'r9', name: 'Colab Room Right (Co-working space)', capacity: 15, floor: 1, amenities: ['Wi-Fi', 'Hot Desks'], image: '', hourly_rate: 0 },
    { id: 'r10', name: 'Maker Studio (Wood workshop)', capacity: 8, floor: 0, amenities: ['Saws', 'Workbenches'], image: '', hourly_rate: 0 },
    { id: 'r11', name: 'Maker Studio (Metal Workshop)', capacity: 8, floor: 0, amenities: ['Welding', 'Lathe'], image: '', hourly_rate: 0 },
    { id: 'r12', name: 'Creative Studio (Photography/Videography)', capacity: 6, floor: 2, amenities: ['Cameras', 'Lights', 'Green Screen'], image: '', hourly_rate: 0 },
    { id: 'r13', name: 'Creative Studio (Music)', capacity: 4, floor: 2, amenities: ['Instruments', 'DAW', 'Sound Proof'], image: '', hourly_rate: 0 },
    { id: 'r14', name: 'Admin Office', capacity: 6, floor: 1, amenities: ['Desks', 'Printer', 'Safe'], image: '', hourly_rate: 0 },
];

export const EQUIPMENT = [
    { id: 'e1', name: '3D Printer - Prusa', available: true, image: '' },
    { id: 'e2', name: 'Laser Cutter', available: true, image: '' },
    { id: 'e3', name: 'VR Headset - Meta Quest', available: true, image: '' },
    { id: 'e4', name: 'Drone - DJI Mini', available: false, image: '' },
    { id: 'e5', name: 'Camera - Sony A7IV', available: true, image: '' },
    { id: 'e6', name: 'Portable Projector', available: true, image: '' },
    { id: 'e7', name: 'Soldering Station', available: true, image: '' },
    { id: 'e8', name: 'Oscilloscope', available: true, image: '' },
];

const firstNames = ['Alex', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Quinn', 'Avery', 'Riley', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper', 'Jamie', 'Kendall', 'Logan', 'Marley', 'Nico', 'Oakley', 'Parker', 'Reese', 'Sage', 'Skyler', 'Toby'];
const lastNames = ['Chen', 'Williams', 'Rodriguez', 'Kim', 'Patel', 'Nguyen', 'Anderson', 'Martinez', 'Thompson', 'Garcia', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Jackson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'King'];

export function generateMockMembers(count = 24) {
    return Array.from({ length: count }, (_, i) => {
        const first = firstNames[i % firstNames.length];
        const last = lastNames[i % lastNames.length];
        const tier = MEMBERSHIP_TIERS[Math.floor(Math.random() * MEMBERSHIP_TIERS.length)];
        const statuses = ['active', 'active', 'active', 'active', 'expired', 'suspended'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysUntilExpiry = Math.floor(Math.random() * 365) - 30;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + daysUntilExpiry);

        return {
            id: `m${i + 1}`,
            firstName: first,
            lastName: last,
            email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${first}+${last}&backgroundColor=22c55e,f97316,eab308`,
            tier,
            status,
            joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
            expiryDate: expiry.toISOString(),
            paymentStatus: Math.random() > 0.15 ? 'paid' : 'overdue',
            accessCount: Math.floor(Math.random() * 200),
            lastAccess: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        };
    });
}

const logTypes = ['entry', 'exit', 'room_access', 'equipment_use', 'denied'];
const logReasons = ['', '', '', '', 'expired_membership', 'suspended_account', 'invalid_qr', 'outside_hours'];

export function generateMockLogs(count = 120) {
    const logs = [];
    for (let i = 0; i < count; i++) {
        const type = logTypes[Math.floor(Math.random() * logTypes.length)];
        const member = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
        const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
        const ts = new Date(Date.now() - Math.random() * 30 * 86400000);

        logs.push({
            id: `log${i + 1}`,
            type,
            memberName: member,
            memberId: `m${Math.floor(Math.random() * 24) + 1}`,
            timestamp: ts.toISOString(),
            location: type === 'room_access' ? room.name : type === 'equipment_use' ? EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)].name : 'Main Entrance',
            device: `Scanner-${Math.floor(Math.random() * 5) + 1}`,
            reason: type === 'denied' ? logReasons.filter(r => r)[Math.floor(Math.random() * 4)] : '',
            success: type !== 'denied',
        });
    }
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function generateMockNotifications() {
    return [
        { id: 'n1', type: 'warning', title: 'Membership Expiring', message: 'Your Pro membership expires in 5 days. Renew now to keep access.', time: new Date(Date.now() - 3600000).toISOString(), read: false },
        { id: 'n2', type: 'info', title: 'Booking Reminder', message: 'You have a booking for Innovation Lab A tomorrow at 10:00 AM.', time: new Date(Date.now() - 7200000).toISOString(), read: false },
        { id: 'n3', type: 'success', title: 'Payment Received', message: 'Your payment of ₦79.00 for Pro tier has been processed.', time: new Date(Date.now() - 86400000).toISOString(), read: true },
        { id: 'n4', type: 'error', title: 'Access Denied', message: 'An access attempt with your credentials was denied at Main Entrance.', time: new Date(Date.now() - 172800000).toISOString(), read: true },
        { id: 'n5', type: 'info', title: 'New Equipment Available', message: 'A new Oscilloscope has been added to the equipment library.', time: new Date(Date.now() - 259200000).toISOString(), read: true },
        { id: 'n6', type: 'success', title: 'Visitor Arrived', message: 'Your visitor Jane Doe has arrived at the front desk.', time: new Date(Date.now() - 345600000).toISOString(), read: true },
    ];
}

export function generateMockBookings() {
    const bookings = [];
    for (let i = 0; i < 8; i++) {
        const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
        const daysOffset = Math.floor(Math.random() * 14) - 3;
        const startHour = 8 + Math.floor(Math.random() * 9);
        const duration = 1 + Math.floor(Math.random() * 3);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + daysOffset);
        startDate.setHours(startHour, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startHour + duration);
        const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled'];

        bookings.push({
            id: `b${i + 1}`,
            resourceType: Math.random() > 0.3 ? 'room' : 'equipment',
            resourceId: room.id,
            resourceName: room.name,
            resourceEmoji: room.image,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        });
    }
    return bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

export function generateQRToken(userId, secret = 'hub-secret-key') {
    const timestamp = Math.floor(Date.now() / 30000); // 30-second window
    const payload = `${userId}:${timestamp}:${secret}`;
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
        const char = payload.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `IHAP:${userId}:${timestamp}:${Math.abs(hash).toString(36)}`;
}

export const ANALYTICS_DATA = {
    dailyActiveUsers: [82, 95, 78, 110, 103, 97, 120, 115, 88, 105, 130, 125, 98, 140],
    qrScansPerDay: [245, 312, 198, 356, 289, 310, 378, 340, 256, 302, 390, 365, 280, 410],
    failedAttempts: [3, 5, 1, 8, 2, 4, 6, 3, 7, 2, 4, 5, 3, 6],
    bookingFrequency: [12, 18, 8, 22, 15, 20, 25, 19, 14, 21, 28, 24, 16, 30],
    membershipUpgrades: [2, 1, 3, 0, 2, 4, 1, 3, 2, 1, 5, 3, 2, 4],
};
