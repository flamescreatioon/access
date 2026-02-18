require('dotenv').config();

module.exports = {
    development: {
        storage: './database.sqlite',
        dialect: 'sqlite',
    },
    test: {
        storage: './test-database.sqlite',
        dialect: 'sqlite',
        logging: false
    },
    production: {
        storage: process.env.DB_STORAGE || './database.sqlite',
        dialect: 'sqlite',
    }
};
