require("dotenv").config();
const mysql = require("mysql2/promise");

module.exports = async (req, res) => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
        });

        if (req.method === "POST") {
            const { name, address, latitude, longitude } = req.body;
            if (!name || !address || !latitude || !longitude) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const [result] = await db.execute(
                "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
                [name, address, latitude, longitude]
            );

            res.json({ message: "School added successfully", id: result.insertId });
        } else if (req.method === "GET") {
            const { latitude, longitude } = req.query;
            if (!latitude || !longitude) {
                return res.status(400).json({ error: "Latitude and Longitude are required" });
            }

            const [results] = await db.execute(
                "SELECT *, (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude)))) AS distance FROM schools ORDER BY distance",
                [latitude, longitude, latitude]
            );

            res.json(results);
        } else {
            res.status(405).json({ error: "Method Not Allowed" });
        }

        await db.end();
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error.message });
    }
};
