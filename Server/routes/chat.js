const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Lấy lịch sử chat theo userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const chat = await Chat.findOne({
      participants: { $all: [req.user.id, userId] }
    }).populate('messages.sender', 'firstName lastName');

    if (!chat) {
      return res.status(404).json({ msg: 'No chat history found' });
    }

    res.json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Gửi tin nhắn mới
router.post('/:userId', auth, async (req, res) => {
  const { text } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, req.params.userId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, req.params.userId],
        messages: []
      });
    }

    const newMessage = {
      sender: req.user.id,
      text,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
