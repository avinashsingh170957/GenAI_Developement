import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

export async function AddExpence({ name, amount }) {
    await db.execute(
        `INSERT INTO expenses
        (title, category, amount, expense_date, payment_method)
        VALUES (?, ?, ?, NOW(), ?)`,
        [name, 'General', amount, 'Cash']
    );

    return `Expense added successfully: ${name} ₹${amount}`;
}
export async function GetExpence({ from = "", to = "", search = "" }) {
    //console.log(`search`, search);

    let query = `
        SELECT
            title,
            category,
            amount,
            expense_date,
            payment_method
        FROM expenses
    `;

    let params = [];

    if (from && to) {
        query += ` WHERE expense_date BETWEEN ? AND ?`;
        params.push(from, to);
    }
    if (search) 
    {
        if (search.toLowerCase()=='total') {
            query = ``;
            query = `SELECT SUM(amount) FROM expenses`
        } else {            
        query += ` WHERE title LIKE ?`;
        params.push(`%${search}%`);
        }
    }
    query += ` ORDER BY expense_date DESC`;
    //console.log(query);

    const [rows] = await db.execute(query, params);

    return rows;
}