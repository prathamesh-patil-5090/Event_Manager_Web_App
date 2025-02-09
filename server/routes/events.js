const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const Event = require('../models/Event');
const User = require('../models/User');

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      creator: req.userData.userId
    };

    if (req.file) {
      eventData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const event = new Event(eventData);
    const savedEvent = await event.save();
    
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate('creator', 'username')
      .select('-image.data');

    const io = req.app.get('io');
    if (io) {
      io.emit('newEvent', populatedEvent);
    }
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('creator', 'username');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-events', auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.userData.userId })
      .populate('creator', 'username')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/creator/:username', async (req, res) => {
  try {
    const creator = await User.findOne({ username: req.params.username });
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const events = await Event.find({ creator: creator._id })
      .populate('creator', 'username')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:eventId/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.participants.includes(req.userData.userId)) {
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    if (event.creator.toString() === req.userData.userId) {
      return res.status(400).json({ message: 'Event creator cannot register as participant' });
    }

    event.participants.push(req.userData.userId);
    const updatedEvent = await event.save();

    const populatedEvent = await Event.findById(updatedEvent._id)
      .populate('creator', 'username')
      .populate('participants', 'username');

    const io = req.app.get('io');
    if (io) {
      io.emit('eventRegistration', populatedEvent);
    }

    res.json(populatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:eventId/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.participants.includes(req.userData.userId)) {
      return res.status(400).json({ message: 'User is not registered for this event' });
    }

    event.participants = event.participants.filter(
      (participantId) => participantId.toString() !== req.userData.userId
    );
    
    const updatedEvent = await event.save();

    const populatedEvent = await Event.findById(updatedEvent._id)
      .populate('creator', 'username')
      .populate('participants', 'username');

    const io = req.app.get('io');
    if (io) {
      io.emit('eventRegistration', populatedEvent);
    }

    res.json(populatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, creator: req.userData.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const updateData = { ...req.body };
    
    if (req.body.deleteImage === 'true') {
      updateData.image = null;
    } else if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('creator', 'username')
    .select('-image.data');

    const io = req.app.get('io');
    if (io) {
      io.emit('updateEvent', updatedEvent);
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username')
      .populate('participants', 'username')
      .select('-image.data');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('image');
    
    if (!event || !event.image || !event.image.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', event.image.contentType);
    res.set('Cache-Control', 'public, max-age=31557600');
    res.send(event.image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.image || !event.image.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', event.image.contentType);
    res.send(event.image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/registration-status', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('participants creator');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isRegistered = event.participants.includes(req.userData.userId);
    const isCreator = event.creator.toString() === req.userData.userId;

    res.json({
      isRegistered,
      isCreator,
      status: isCreator ? 'creator' : (isRegistered ? 'registered' : 'not-registered')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, creator: req.userData.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteEvent', req.params.id);
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status (500).json({ error: error.message });
  }
});

router.delete('/:id/image', auth, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, creator: req.userData.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    if (!event.image) {
      return res.status(404).json({ message: 'No image exists for this event' });
    }

    event.image = undefined;
    const updatedEvent = await event.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('updateEvent', updatedEvent);
    }

    res.json({ 
      message: 'Image deleted successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
