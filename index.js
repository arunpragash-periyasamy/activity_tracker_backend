// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL host
  user: 'system_activity', // Replace with your MySQL username
  password: 'system_activity_password', // Replace with your MySQL password
  database: 'system_activity', // Replace with your database name
});

// POST endpoint to handle the request
app.post('/api/status', async (req, res) => {
  try {
    const { userName, status } = req.body;
    console.log(status)
    if (!userName || !status) {
      return res.status(400).json({ message: 'userName and status are required.' });
    }

    const today = new Date();
    const todayString = today.toISOString().slice(0, 10); // Format as YYYY-MM-DD

    // Query the latest entry for the user for today4
    let query = `SELECT status FROM activity_tracker 
       WHERE user_name = ? AND DATE(date) = ? 
       ORDER BY id DESC 
       LIMIT 1`;
    const [rows] = await db.promise().query(query, [userName, todayString]);
    console.log(rows[0]);

    const latestEntry = rows[0];

    // Check the conditions to add a new entry
    if (!latestEntry || latestEntry.status !== status) {
      // Insert a new entry
      await db.promise().query(
        `INSERT INTO activity_tracker (user_name, status, date) 
         VALUES (?, ?, NOW())`,
        [userName, status]
      );
      return res.status(201).json({ message: 'Status updated successfully.' });
    }

    // If the conditions are not met, no new entry is added
    res.status(200).json({ message: 'No changes made to the user status.' });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/check', async (req, res) => {
  console.log(req.body)
  res.send({ status: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

