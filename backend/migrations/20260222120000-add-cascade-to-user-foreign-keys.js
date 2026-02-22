'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = [
            { name: 'Memberships', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'AccessLogs', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'Bookings', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'AuditLogs', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'RefreshTokens', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'UserCertifications', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'Notifications', fk: 'user_id', onDelete: 'CASCADE' },
            { name: 'PushSubscriptions', fk: 'user_id', onDelete: 'CASCADE' },
            // Optional: Admin references that should be SET NULL
            { name: 'AccessLogs', fk: 'manager_id', onDelete: 'SET NULL' },
            { name: 'UserCertifications', fk: 'certified_by', onDelete: 'SET NULL' },
            { name: 'RejectedAccounts', fk: 'rejected_by', onDelete: 'SET NULL' }
        ];

        for (const table of tables) {
            try {
                // Drop existing constraint if it exists (Sequelize doesn't give a generic name easy to guess, usually "Table_fk_fkey")
                // But for PostgreSQL, we can try to drop by name or use a raw query to find it.
                // Simplest way for a migration is to add a fresh constraint with a known name.

                const constraintName = `${table.name}_${table.fk}_fkey_cascade`;

                // Check if constraint exists and drop it first (raw query for Postgres)
                await queryInterface.sequelize.query(`
          ALTER TABLE "${table.name}" 
          DROP CONSTRAINT IF EXISTS "${table.name}_${table.fk}_fkey",
          DROP CONSTRAINT IF EXISTS "${constraintName}"
        `);

                await queryInterface.addConstraint(table.name, {
                    fields: [table.fk],
                    type: 'foreign key',
                    name: constraintName,
                    references: {
                        table: 'Users',
                        field: 'id'
                    },
                    onDelete: table.onDelete,
                    onUpdate: 'CASCADE'
                });
            } catch (err) {
                console.warn(`Could not update constraint for ${table.name}.${table.fk}: ${err.message}`);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        // Reverting this is complex as we don't know the exact original state, 
        // but usually we just drop our custom constraints.
    }
};
