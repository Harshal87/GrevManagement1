import { create } from 'zustand'
import { listTracks, getStreamUrl } from './api'
export const useStore = create((set,get)=>({
  tracks:[], queue:[], current:null, audio:new Audio(), loading:false,
  fetchTracks: async (q='')=>{ set({loading:true}); const items=await listTracks(q); set({tracks:items,loading:false}); },
  playTrack: async (track)=>{ const url=await getStreamUrl(track.id); const a=get().audio; a.src=url; await a.play(); set({current:track}); },
  enqueue: (t)=>{ const q=get().queue.slice(); q.push(t); set({queue:q}); },
  next: async ()=>{ const q=get().queue.slice(); const n=q.shift(); set({queue:q}); if(n) get().playTrack(n); }
}))