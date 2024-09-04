const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Define the Chat model
const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Chat = mongoose.model('Chat', ChatSchema);

// Create an HTTP server with Express
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url.split('/');
  const chatId = pathname[pathname.length - 1];

  wss.handleUpgrade(request, socket, head, ws => {
    ws.chatId = chatId;
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', ws => {
  console.log('Client connected to chat:', ws.chatId);

  ws.on('message', async message => {
    const parsedMessage = JSON.parse(message);
    console.log(`Received message: ${parsedMessage.text}`);

    // Save the message to the database
    try {
      await Chat.findByIdAndUpdate(
        ws.chatId,
        { $push: { messages: parsedMessage } },
        { new: true }
      );

      // Broadcast the message to all clients connected to the same chatId
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.chatId === ws.chatId) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from chat:', ws.chatId);
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/userCourses', require('./routes/userCourses'));
app.use('/api/exam', require('./routes/exam')); 
app.use('/api/courses', require('./routes/courses'));
app.use('/api/chat', require('./routes/chat'));  
app.use('/api/users', require('./routes/user')); 
