const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// MongoDB Atlas Connection
mongoose.connect('mongodb+srv://Chaitanya_Barappadi:EiffeLtower1234%23@authdb.8xfqgkj.mongodb.net/auth_db?retryWrites=true&w=majority&appName=authDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Signup Route
app.post('/api/users/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingName = await User.findOne({ name });
    if (existingName) {
      const suggestions = [
        `${name}${Math.floor(Math.random() * 1000)}`,
        `${name}_${Math.floor(Math.random() * 100)}`,
        `${name}.${Math.floor(Math.random() * 100)}`
      ];
      return res.status(400).json({
        message: 'Username already exists. Please choose another one.',
        suggestions
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists. Please log in.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(200).json({ message: 'Signup successful!' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// Login Route
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    res.status(200).json({ message: `Login successful! Welcome ${user.name}` });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Server Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
