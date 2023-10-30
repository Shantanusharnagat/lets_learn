// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cookieParser =require('cookie-parser');

router.use(cookieParser())

// User registration
router.post('/register', async(req, res) => {
  const { username, email, password, role } = req.body;
 const user = new User({ username, email, password, role });
  try {
    
    await user.save();
    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    const useremail = await User.findOne({ email }).exec();
    if (useremail) {
      return res.status(400).json({ error: 'User already exists' });
    }
    else{
      res.status(400).json({ error: 'Registration failed' });

    }
  }
  
});

// ...

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }


    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const isAuthor=user.role=='admin';
    console.log(isAuthor)
    
    // Generate a JWT token for authentication
    const secretKey = 'abc123';
    const token = jwt.sign({ userId: user._id, isAuthor }, secretKey, { expiresIn: '1h' });

    // Set a cookie and redirect to root
    res.cookie('token', token, { httpOnly: true , maxAge: 3600000});
   
    res.status(200).json({ token  });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
