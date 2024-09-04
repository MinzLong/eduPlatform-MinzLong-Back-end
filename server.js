const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'https://edu-platform-minz-long-front-end.vercel.app'], // Replace with your actual frontend domains
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow sending cookies and HTTP authentication information
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Chat model
const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      timestamp: { type: Date, default: Date.now },
    }
  ]
});

const Chat = mongoose.model('Chat', ChatSchema);

// API route to send a message
app.post('/api/chat/:chatId/send', async (req, res) => {
  const { chatId } = req.params;
  const { senderId, text } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const message = { sender: senderId, text };
    chat.messages.push(message);
    await chat.save();

    // Trigger Pusher event
    pusher.trigger(`chat-${chatId}`, 'message', {
      senderId,
      text,
    });

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API route to get chat history
app.get('/api/chat/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate('messages.sender', 'firstName lastName');
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Other API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/userCourses', require('./routes/userCourses'));
app.use('/api/exam', require('./routes/exam')); 
app.use('/api/courses', require('./routes/courses'));
app.use('/api/users', require('./routes/user'));

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
