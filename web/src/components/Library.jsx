import React, { useEffect } from 'react'
import { useStore } from '../store'
export default function Library({ socket }){
  const tracks = useStore(s=>s.tracks)
  const fetchTracks = useStore(s=>s.fetchTracks)
  const play = useStore(s=>s.playTrack)
  const enqueue = useStore(s=>s.enqueue)
  useEffect(()=>{ const on=()=>fetchTracks(); socket.on('library-updated', on); return ()=>socket.off('library-updated', on) }, [])
  return (<div className="mt-4 grid grid-cols-3 gap-3">
    {tracks.map(t=> (<div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
      <div className="h-28 mb-3 rounded-lg bg-gradient-to-tr from-sky-500/40 to-cyan-400/40"></div>
      <div className="font-medium">{t.title}</div>
      <div className="text-xs text-white/60">{t.artist}</div>
      <div className="mt-2 flex gap-2">
        <button className="btn" onClick={()=>play(t)}>Play</button>
        <button className="btn-sec" onClick={()=>enqueue(t)}>Queue</button>
      </div>
    </div>))}
  </div>)
}