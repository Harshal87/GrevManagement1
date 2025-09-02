import express from 'express'
import { readConfig, writeConfig } from '../config.js'

export default function settingsRouter(io){
  const router = express.Router()

  router.get('/admin/settings', (req,res)=>{
    res.json(readConfig())
  })

  router.put('/admin/settings', (req,res)=>{
    const { region, bucket, prefix } = req.body || {}
    const updated = writeConfig({
      ...(region ? { region: String(region) } : {}),
      ...(bucket ? { bucket: String(bucket) } : {}),
      ...(prefix ? { prefix: String(prefix) } : {}),
    })
    io.emit('settings-updated', updated)
    res.json(updated)
  })

  return router
}
