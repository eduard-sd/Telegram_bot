'use strict';
let { Pool } = require('pg');

let pool = {
    pgPool: new Pool({
        host: 'localhost',
        port: '5432',
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
    })
};

module.exports = pool;




