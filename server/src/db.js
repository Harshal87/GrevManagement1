import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

export let db;
export function initDb() {
  db = new Database('data.sqlite');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT DEFAULT 'Unknown',
      album TEXT DEFAULT '',
      s3_key TEXT NOT NULL,
      cover_key TEXT,
      duration INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS playlist_tracks (
      playlist_id TEXT,
      track_id TEXT,
      position INTEGER DEFAULT 0,
      PRIMARY KEY (playlist_id, track_id)
    );
  `);
}
export function createTrack({ title, artist, album, s3_key, cover_key = null, duration = 0 }) {
  const id = nanoid(10);
  db.prepare(`INSERT INTO tracks (id,title,artist,album,s3_key,cover_key,duration) VALUES (?,?,?,?,?,?,?)`)
    .run(id, title, artist, album, s3_key, cover_key, duration);
  return getTrack(id);
}
export function getTrack(id) { return db.prepare('SELECT * FROM tracks WHERE id = ?').get(id); }
export function listTracks(q) {
  if (q) {
    const like = `%${q}%`;
    return db.prepare('SELECT * FROM tracks WHERE title LIKE ? OR artist LIKE ? ORDER BY created_at DESC').all(like, like);
  }
  return db.prepare('SELECT * FROM tracks ORDER BY created_at DESC').all();
}
export function createPlaylist(name) { const id = nanoid(8); db.prepare('INSERT INTO playlists (id, name) VALUES (?, ?)').run(id, name); return getPlaylist(id); }
export function getPlaylist(id) {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
  if (!playlist) return null;
  const tracks = db.prepare(`SELECT t.*, pt.position FROM playlist_tracks pt JOIN tracks t ON t.id = pt.track_id WHERE pt.playlist_id = ? ORDER BY pt.position ASC`).all(id);
  return { ...playlist, tracks };
}
export function addTrackToPlaylist(playlist_id, track_id, position = 0) {
  db.prepare('INSERT OR REPLACE INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)').run(playlist_id, track_id, position);
  return getPlaylist(playlist_id);
}
