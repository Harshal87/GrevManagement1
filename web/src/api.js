import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
export const api = axios.create({ baseURL: API_BASE })
export async function listTracks(q=''){ const { data } = await api.get('/api/tracks',{ params:{q} }); return data.items }
export async function getStreamUrl(id){ const { data } = await api.get(`/api/tracks/${id}/stream`); return data.url }
export async function createPlaylist(name){ const { data } = await api.post('/api/playlists', { name }); return data }
export async function getPlaylist(id){ const { data } = await api.get(`/api/playlists/${id}`); return data }
export async function addToPlaylist(id, trackId, position=0){ const { data } = await api.post(`/api/playlists/${id}/tracks`, { trackId, position }); return data }
