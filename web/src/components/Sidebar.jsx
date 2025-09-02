import React from 'react'
export default function Sidebar(){
  return (<aside className="card p-4">
    <h2 className="text-lg font-semibold mb-4">Spotify Clone</h2>
    <nav className="space-y-2">
      <a className="block btn-sec">Home</a>
      <a className="block btn-sec">Browse</a>
      <a className="block btn-sec">Your Library</a>
    </nav>
    <p className="text-xs text-white/60 mt-6">Upload via /api/admin/upload</p>
  </aside>)
}