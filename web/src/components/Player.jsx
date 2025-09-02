import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
export default function Player(){
  const audio = useStore(s=>s.audio)
  const current = useStore(s=>s.current)
  const next = useStore(s=>s.next)
  const [progress,setProgress] = useState(0)
  useEffect(()=>{ const onTime=()=>setProgress(audio.currentTime/(audio.duration||1)); const onEnd=()=>next(); audio.addEventListener('timeupdate', onTime); audio.addEventListener('ended', onEnd); return ()=>{ audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnd);} }, [])
  return (<div className="mt-auto">
    <div className="text-sm mb-2">{current ? `${current.title} – ${current.artist}` : 'Nothing playing'}</div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{width:`${progress*100}%`}}/></div>
    <div className="mt-3 flex gap-2"><button className="btn-sec" onClick={()=>audio.pause()}>Pause</button><button className="btn-sec" onClick={()=>audio.play()}>Play</button><button className="btn-sec" onClick={()=>{audio.currentTime=Math.max(0,audio.currentTime-10)}}>-10s</button><button className="btn-sec" onClick={()=>{audio.currentTime=audio.currentTime+10}}>+10s</button></div>
  </div>)
}