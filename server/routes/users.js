const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:user_id/profile-picture', async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id)
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

router.get('/:user_id', async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id)
      .select('username email hasProfilePicture createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      hasProfilePicture: !!user.profilePicture,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
