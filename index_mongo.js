// Import necessary modules
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require("cors");
const corsOptions = {
    origin: ['http://localhost:3000', 'https://localhost:3000'],  // Add your allowed origins here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies and credentials
  };

// Initialize Express app
const app = express();
app.use(cors(corsOptions))
// Middleware to parse JSON requests
app.use(bodyParser.json());

// MongoDB connection
const uri = 'mongodb+srv://activity_tracker:activity_tracker_password@activity-tracker.pf9hg.mongodb.net/?retryWrites=true&w=majority&appName=Activity-tracker'; // Replace with your MongoDB URI
const client = new MongoClient(uri);

// Database and collection names
const dbName = 'system_activity';
const collectionName = 'activity_tracker';

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}
connectToMongoDB();

app.get("/", async(req,res)=>{
    res.send("Activity tracker")
})

// POST endpoint to handle the request
app.post('/api/status', async (req, res) => {
  try {
    const { userName, status } = req.body;
    if (!userName || !status) {
      return res.status(400).json({ message: 'userName and status are required.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of the day

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Query the latest entry for the user for today
    const latestEntry = await collection.findOne(
      {
        user_name: userName,
        date: { $gte: today },
      },
      {
        sort: { date: -1 },
        projection: { status: 1 },
      }
    );

    // Check the conditions to add a new entry
    if (!latestEntry || latestEntry.status !== status) {
      // Insert a new entry
      await collection.insertOne({
        user_name: userName,
        status,
        date: new Date(),
      });
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
  console.log(req.body);
  res.send({ status: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
