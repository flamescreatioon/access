'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('CafeItems', [
            {
                name: 'Classic Espresso',
                description: 'Rich, full-bodied espresso with a bold aroma.',
                category: 'Drinks',
                price: 1500.00,
                image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80',
                is_available: true,
                stock_quantity: 50,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Cappuccino',
                description: 'Perfect balance of espresso, steamed milk and foam.',
                category: 'Drinks',
                price: 2000.00,
                image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&q=80',
                is_available: true,
                stock_quantity: 50,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Butter Croissant',
                description: 'Flaky, buttery French pastry baked fresh daily.',
                category: 'Snacks',
                price: 1200.00,
                image_url: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=500&q=80',
                is_available: true,
                stock_quantity: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Chicken Club Sandwich',
                description: 'Grilled chicken, bacon, lettuce, tomato, and mayo on toasted bread.',
                category: 'Meals',
                price: 3500.00,
                image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80',
                is_available: true,
                stock_quantity: 20,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Iced Latte',
                description: 'Chilled espresso and milk served over ice.',
                category: 'Drinks',
                price: 2200.00,
                image_url: 'https://images.unsplash.com/photo-1517701550927-30cfcb64ac45?w=500&q=80',
                is_available: true,
                stock_quantity: 40,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Chocolate Chip Muffin',
                description: 'Soft, fluffy muffin loaded with chocolate chips.',
                category: 'Snacks',
                price: 1500.00,
                image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80',
                is_available: false,
                stock_quantity: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('CafeItems', null, {});
    }
};
