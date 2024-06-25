const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "myverysecuresecretkey123!";

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/auth')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Student model
const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    course: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Student = mongoose.model('Student', StudentSchema);

// Register a new user
app.post('/register', async (req, res) => {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
        return res.status(400).send('Username, email, password, and name are required');
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).send('User with the given username or email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            name
        });

        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login a user and generate a JWT
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ userId: user._id, username: user.username, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send('Access Denied');
  }
  try {
    const verified = jwt.verify(token.split(' ')[1], SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// CRUD routes for students
// Create a student
app.post('/students', authenticateToken, async (req, res) => {
    const { name, age, course } = req.body;
    if (!name || !age || !course) {
        return res.status(400).send('Name, age, and course are required');
    }

    const student = new Student({
        name,
        age,
        course,
        userId: req.user.userId
    });

    try {
        await student.save();
        res.status(201).send('Student added');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Read all students for the authenticated user
app.get('/students', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find({ userId: req.user.userId });
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update a student
app.put('/students/:id', authenticateToken, async (req, res) => {
    const { name, age, course } = req.body;
    if (!name || !age || !course) {
        return res.status(400).send('Name, age, and course are required');
    }

    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { name, age, course },
            { new: true }
        );

        if (!student) {
            return res.status(404).send('Student not found');
        }

        res.send('Student updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete a student
app.delete('/students/:id', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!student) {
            return res.status(404).send('Student not found');
        }

        res.send('Student deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
