import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import tracksRouter from './routes/tracks.js';
import playlistsRouter from './routes/playlists.js';
import uploadRouter from './routes/upload.js';
import settingsRouter from './routes/settings.js';
import { initDb } from './db.js';

const app = express();
const server = http.createServer(app);

const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
const io = new SocketIOServer(server, { cors: { origin: allowed.length? allowed : '*', methods: ['GET','POST','PUT','DELETE'] } });

app.use(express.json({ limit: '20mb' }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: false }));

initDb();

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => { socket.join(roomId); io.to(roomId).emit('system', `Joined ${roomId}`); });
  socket.on('leave-room', (roomId) => socket.leave(roomId));
  socket.on('now-playing', (payload) => { const { roomId, track } = payload || {}; (roomId? io.to(roomId):io).emit('now-playing', track); });
  socket.on('queue-updated', (payload) => { const { roomId, queue } = payload || {}; (roomId? io.to(roomId):io).emit('queue-updated', queue); });
});

app.use('/api', tracksRouter(io));
app.use('/api', playlistsRouter(io));
app.use('/api', uploadRouter(io));
app.use('/api', settingsRouter(io));

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server http://localhost:${port}`));
