import express from 'express';
import { createPlaylist, getPlaylist, addTrackToPlaylist } from '../db.js';

export default function playlistsRouter(io) {
  const router = express.Router();
  router.post('/playlists', (req, res) => { const name = (req.body.name || '').trim() || 'My Playlist'; res.json(createPlaylist(name)); });
  router.get('/playlists/:id', (req, res) => { const pl = getPlaylist(req.params.id); if (!pl) return res.status(404).json({ error: 'Not found' }); res.json(pl); });
  router.post('/playlists/:id/tracks', (req, res) => { const { trackId, position = 0 } = req.body || {}; const pl = addTrackToPlaylist(req.params.id, trackId, position); io.emit('playlist-updated', { playlistId: req.params.id }); res.json(pl); });
  return router;
}
