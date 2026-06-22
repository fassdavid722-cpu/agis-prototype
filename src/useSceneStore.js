// useSceneStore.js — AGIS v3.0 — Persistent scene memory + context awareness
import { useState, useCallback, useRef } from 'react'

export function useSceneStore() {
  const [scene, setScene] = useState(null)           // active scene descriptor
  const [objects, setObjects] = useState([])          // all objects in scene (id, name, mesh, meta)
  const [selectedId, setSelectedId] = useState(null)  // currently selected object id
  const [camera, setCamera] = useState({ pos: [0, 0.8, 7.5], zoom: 1 })
  const [modifications, setModifications] = useState([])
  const [history, setHistory] = useState([])
  const [isolateMode, setIsolateMode] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  const selectedObject = objects.find(o => o.id === selectedId) || null

  const loadScene = useCallback((descriptor, objectList) => {
    setScene(descriptor)
    setObjects(objectList)
    setSelectedId(null)
    setIsolateMode(false)
    setModifications([])
    setHistory(prev => [...prev, {
      type: 'scene_load',
      scene: descriptor.object,
      ts: Date.now(),
    }].slice(-50))
  }, [])

  const selectObject = useCallback((id) => {
    setSelectedId(id)
    setHistory(prev => [...prev, {
      type: 'select',
      objectId: id,
      ts: Date.now(),
    }].slice(-50))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedId(null)
    setIsolateMode(false)
  }, [])

  const isolate = useCallback((id) => {
    setSelectedId(id)
    setIsolateMode(true)
  }, [])

  const exitIsolate = useCallback(() => {
    setIsolateMode(false)
  }, [])

  const modifyObject = useCallback((id, mod) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, ...mod } : o))
    setModifications(prev => [...prev, { objectId: id, mod, ts: Date.now() }])
  }, [])

  const removeObject = useCallback((id) => {
    setObjects(prev => prev.filter(o => o.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const addMessage = useCallback((role, content) => {
    setChatHistory(prev => [...prev, { role, content, ts: Date.now() }])
  }, [])

  const updateCamera = useCallback((pos, zoom) => {
    setCamera({ pos, zoom })
  }, [])

  return {
    scene, objects, selectedId, selectedObject,
    camera, modifications, history, isolateMode,
    chatHistory,
    loadScene, selectObject, deselectAll,
    isolate, exitIsolate, modifyObject, removeObject,
    addMessage, updateCamera,
    setObjects,
  }
}
