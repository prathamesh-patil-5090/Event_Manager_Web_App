const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Registration request received');
    console.log('Request body:', req.body);
    console.log('File details:', req.file ? {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email and password are required',
        received: { username, email, password: !!password }
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword
    };

    if (req.file) {
      console.log('Processing profile picture:', req.file.mimetype);
      if (!req.file.buffer) {
        throw new Error('File buffer is missing');
      }
      
      userData.profilePicture = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const user = new User(userData);
    await user.save();
    
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      userId: user._id,
      username: user.username,
      email: user.email,
      hasProfilePicture: !!req.file,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists`
      });
    }

    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message,
      details: error.stack
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });
    
    if (!user) {
      console.log('Login failed: User not found for:', emailOrUsername);
      return res.status(401).json({ 
        message: 'User not found with provided email/username'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for user:', emailOrUsername);
      return res.status(401).json({ 
        message: 'Invalid password'
      });
    }
    
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId)
      .select('-password -profilePicture.data');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      hasProfilePicture: !!user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId)
      .select('profilePicture');

    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.set('Content-Type', user.profilePicture.contentType);
    res.set('Cache-Control', 'public, max-age=31557600');
    res.send(user.profilePicture.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    user.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      hasProfilePicture: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/me/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(404).json({ message: 'No profile picture exists' });
    }

    user.profilePicture = undefined;
    await user.save();

    res.json({ 
      message: 'Profile picture deleted successfully',
      hasProfilePicture: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
