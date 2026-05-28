// ReadExpence.js
import connection from '../config/dbconfig.js';

async function ReadExpence() {
    try {

        const query = `
            SELECT 
                title,
                category,
                amount,
                expense_date,
                payment_method
            FROM expenses
        `;

        const result = await new Promise((resolve, reject) => {

            connection.query(query, (err, rows) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }

            });

        });

        return result;

    } catch (error) {

        console.log("Database Error:", error);
        throw error;

    }
}

export default ReadExpence;