import { readConfig } from '../config.js'
import express from 'express';
import multer from 'multer';
import { putObject } from '../s3.js';
import { createTrack } from '../db.js';
import { nanoid } from 'nanoid';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

export default function uploadRouter(io) {
  const router = express.Router();
  router.post('/admin/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
    try {
      const audio = req.files?.audio?.[0];
      if (!audio) return res.status(400).json({ error: 'audio file required (field name: audio)' });
      const title = (req.body.title || audio.originalname).replace(/\.[a-z0-9]+$/i, '');
      const artist = (req.body.artist || 'Unknown').trim();
      const album = (req.body.album || '').trim();
      const id = nanoid(10);
      const { prefix, bucket } = readConfig();
      const audioKey = `${prefix}${id}-${audio.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      await putObject({ Bucket: bucket, Key: audioKey, Body: audio.buffer, ContentType: audio.mimetype });
      let coverKey = null;
      const cover = req.files?.cover?.[0];
      if (cover) {
        coverKey = `${prefix}${id}-cover-${cover.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
        await putObject({ Bucket: bucket, Key: coverKey, Body: cover.buffer, ContentType: cover.mimetype });
      }
      const track = createTrack({ title, artist, album, s3_key: audioKey, cover_key: coverKey, duration: Number(req.body.duration || 0) });
      io.emit('library-updated');
      res.json(track);
    } catch (e) { console.error(e); res.status(500).json({ error: 'upload failed', details: String(e) }); }
  });
  return router;
}
