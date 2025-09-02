import { readConfig } from '../config.js'
import express from 'express';
import { listTracks, getTrack } from '../db.js';
import { presignGet } from '../s3.js';

export default function tracksRouter(io) {
  const router = express.Router();
  router.get('/tracks', (req, res) => { const q = (req.query.q || '').trim(); res.json({ items: listTracks(q) }); });
  router.get('/tracks/:id', (req, res) => { const t = getTrack(req.params.id); if (!t) return res.status(404).json({ error: 'Not found' }); res.json(t); });
  router.get('/tracks/:id/stream', async (req, res) => {
    const t = getTrack(req.params.id); if (!t) return res.status(404).json({ error: 'Not found' });
    try { const url = await presignGet({ Bucket: readConfig().bucket, Key: t.s3_key }); if (req.query.redirect) return res.redirect(302, url); res.json({ url }); }
    catch (e) { console.error(e); res.status(500).json({ error: 'presign failed', details: String(e) }); }
  });
  return router;
}
