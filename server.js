// Import required packages
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set up middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB Atlas database
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

// Define schema and model for service requests
const Schema = mongoose.Schema;
const requestSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  notes: { type: String },
  service: { type: String, required: true }
}, {
  timestamps: true
});
const Request = mongoose.model("Request", requestSchema);

// Define route to handle form submissions
app.post("/servicerequest", async (req, res) => {
  try {
    const { name, phone, email, date, time, notes, service } = req.body;

    const newRequest = new Request({
      name,
      phone,
      email,
      date,
      time,
      notes,
      service
    });

    await newRequest.save();
    res.redirect('/');
    console.log('Data saved: ' + JSON.stringify(newRequest))
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to retrieve all service requests and render them to the admin page
app.get('/admin', async (req, res) => {
    try {
        // Retrieve all service requests and sort them by date and time
        const serviceRequests = await Request.find().sort({ date: 'asc', time: 'asc' });
        // Render the service requests to the admin page
        res.render('admin', { serviceRequests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});