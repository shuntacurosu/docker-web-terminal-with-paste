const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Set up image upload using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmpDir = '/tmp';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
    cb(null, `img_${timestamp}.${ext}`);
  }
});
const upload = multer({ storage: storage });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  // Return the path where the image is saved in the container
  res.json({ path: req.file.path, size: req.file.size });
});

// List tmux sessions
app.get('/api/sessions', (req, res) => {
  exec('tmux ls -F "#{session_name}"', (error, stdout, stderr) => {
    if (error) {
      if (error.code === 1 && stderr.includes('no server running')) {
        return res.json({ sessions: [] });
      }
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to list sessions' });
    }
    const sessions = stdout.trim().split('\n').filter(s => s);
    res.json({ sessions });
  });
});

// Setup WebSocket server for node-pty
wss.on('connection', (ws, req) => {
  const reqUrl = url.parse(req.url, true);
  const sessionName = reqUrl.query.session || 'main';

  console.log(`Client connected to session: ${sessionName}`);

  // Command to run: start tmux session or attach to existing one
  const shell = 'tmux';
  const args = ['new-session', '-A', '-s', sessionName];

  // Initialize node-pty
  const ptyProcess = pty.spawn(shell, args, {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || '/root',
    env: process.env
  });

  // Data from terminal -> sending to browser
  ptyProcess.on('data', (data) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Data from browser -> running command via terminal or handling resize
  ws.on('message', (message) => {
    const msgStr = message.toString();
    
    // Intercept custom control messages
    if (msgStr.startsWith('{"type":"resize"')) {
      try {
        const msg = JSON.parse(msgStr);
        if (msg.type === 'resize') {
          ptyProcess.resize(msg.cols, msg.rows);
          return; // Do not write this control message to the terminal
        }
      } catch (e) {
        // Ignored, not valid JSON, pass through to terminal
      }
    }

    // Write normal input to the terminal
    try {
      ptyProcess.write(message);
    } catch (e) {
      console.error(e);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected from session: ${sessionName}`);
    ptyProcess.kill();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
