import React from 'react'
import { useStore } from '../store'
export default function NowPlaying(){ const c = useStore(s=>s.current); return (<div><h3 className="font-semibold mb-2">Now Playing</h3><div className="h-36 rounded-xl bg-white/5 border border-white/10 mb-2"></div><div className="text-sm">{c?c.title:'—'}</div><div className="text-xs text-white/60">{c?c.artist:''}</div></div>) }