'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create EquipmentCategories table
        await queryInterface.createTable('EquipmentCategories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.TEXT
            },
            icon: {
                type: Sequelize.STRING,
                defaultValue: 'Wrench'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 2. Add category_id to Equipments
        await queryInterface.addColumn('Equipments', 'category_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'EquipmentCategories',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // 3. (Optional) Seed some default categories based on current static list
        const timestamp = new Date();
        const categories = [
            { name: '3D Printer', icon: 'Printer', createdAt: timestamp, updatedAt: timestamp },
            { name: 'Laser Cutter', icon: 'Zap', createdAt: timestamp, updatedAt: timestamp },
            { name: 'CNC', icon: 'Cpu', createdAt: timestamp, updatedAt: timestamp },
            { name: 'Electronics', icon: 'Microchip', createdAt: timestamp, updatedAt: timestamp },
            { name: 'Media', icon: 'Video', createdAt: timestamp, updatedAt: timestamp },
            { name: 'VR/AR', icon: 'Glasses', createdAt: timestamp, updatedAt: timestamp },
            { name: 'Power Tools', icon: 'Wrench', createdAt: timestamp, updatedAt: timestamp }
        ];

        await queryInterface.bulkInsert('EquipmentCategories', categories);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Equipments', 'category_id');
        await queryInterface.dropTable('EquipmentCategories');
    }
};
