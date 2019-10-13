'use strict';

const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    port: '5432',
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
});


const sql = `SELECT * FROM telegramdb.balloonprice`;
const sql2 = `SELECT NOW()`;

pool.query(sql, (err, res) => {
    if(err) {
        throw err;
    }
    console.log({ res });
    console.table(res.fields);
    console.table(res.rows);
    pool.end();
});

// pool.query(sql2, (err, res) => {
//     if(err) {
//         throw err;
//     }
//     console.log({ res });
//     console.table(res.fields);
//     console.table(res.rows);
//     pool.end();
// });