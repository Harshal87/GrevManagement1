import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useStore } from './store'
import { createPlaylist } from './api'
import Player from './components/Player.jsx'
import Sidebar from './components/Sidebar.jsx'
import Library from './components/Library.jsx'
import NowPlaying from './components/NowPlaying.jsx'
import Queue from './components/Queue.jsx'
import Room from './components/Room.jsx'
import { api } from './api'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
const socket = io(API_BASE)

export default function App(){
  const fetchTracks = useStore(s=>s.fetchTracks)
  const [search, setSearch] = useState('')
  useEffect(()=>{ fetchTracks() }, [])
  const [openSettings, setOpenSettings] = useState(false)
  const [serverCfg, setServerCfg] = useState(null)
  async function openAdminSettings(){
    const { data } = await api.get('/api/admin/settings')
    setServerCfg(data)
    setOpenSettings(true)
  }
  async function saveAdminSettings(cfg){
    await api.put('/api/admin/settings', cfg)
    setOpenSettings(false)
    setServerCfg(cfg)
    alert('Saved. Server will use these settings immediately.')
  }

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr_360px] gap-4 p-4">
      <Sidebar />
      <main className="card p-4">
        <div className="flex items-center gap-2">
          <input className="input" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn-sec" onClick={()=>fetchTracks(search)}>Search</button>
          <button className="btn" onClick={async()=>{ const pl=await createPlaylist('My Playlist'); alert('Created '+pl.name+' ID:'+pl.id) }}>+ Playlist</button>
        </div>
        <Library socket={socket} />
      </main>
      <aside className="card p-4 flex flex-col gap-4">
        <Room socket={socket} />
        <NowPlaying />
        <Queue />
        <Player />
      </aside>
    </div>
  )
}
function SettingsModal({ open, onClose, initial, onSave }){
  const [region, setRegion] = React.useState(initial?.region || 'ap-south-1')
  const [bucket, setBucket] = React.useState(initial?.bucket || '')
  const [prefix, setPrefix] = React.useState(initial?.prefix || 'spotify/tracks/')
  React.useEffect(()=>{ setRegion(initial?.region||'ap-south-1'); setBucket(initial?.bucket||''); setPrefix(initial?.prefix||'spotify/tracks/') }, [initial])
  if(!open) return null
  return (<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'grid',placeItems:'center',zIndex:50}}>
    <div className="card p-4" style={{minWidth:360}}>
      <h3 className="text-lg font-semibold mb-3">Admin Settings (S3)</h3>
      <div className="space-y-2">
        <div><div className="text-xs mb-1">Region</div><input className="input" value={region} onChange={e=>setRegion(e.target.value)} placeholder="ap-south-1" /></div>
        <div><div className="text-xs mb-1">Bucket</div><input className="input" value={bucket} onChange={e=>setBucket(e.target.value)} placeholder="your-bucket" /></div>
        <div><div className="text-xs mb-1">Prefix</div><input className="input" value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="spotify/tracks/" /></div>
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <button className="btn-sec" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={()=>onSave({region,bucket,prefix})}>Save</button>
      </div>
    </div>
  </div>)
}
