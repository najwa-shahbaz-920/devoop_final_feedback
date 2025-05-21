const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (e.g., index.html) from the 'public' directory
app.use(express.static('public'));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI not set in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Mongoose Schema and Model
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// POST /feedback - Save feedback to MongoDB
app.post('/feedback', async (req, res) => {
  const { name, email, department, category, rating, message } = req.body;

  if (!name || !email || !department || !category || !rating || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const feedback = new Feedback({ name, email, department, category, rating, message });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('❌ Error saving feedback:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Default route for health check
app.get('/', (req, res) => {
  res.send('🎉 Feedback server is up and running!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
