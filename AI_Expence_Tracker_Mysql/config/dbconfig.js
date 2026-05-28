import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log("Database error", err);
    } else {
        console.log("Database Connected");
    }
});

export default connection;