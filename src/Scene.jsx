// Scene.jsx — AGIS v4.0 — Real models, static world, YOU orbit
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Stars, Grid, Html } from '@react-three/drei'
import { ModelForObject } from './Models.jsx'

// Ground grid plane
function Floor() {
  return (
    <Grid
      position={[0, -2.2, 0]}
      args={[40, 40]}
      cellSize={0.6}
      cellThickness={0.4}
      cellColor="#1a1a2e"
      sectionSize={3}
      sectionThickness={1}
      sectionColor="#2a2a4e"
      fadeDistance={28}
      fadeStrength={1.2}
      followCamera={false}
      infiniteGrid
    />
  )
}

// Selection ring around selected object
function SelectionRing({ visible }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.8
  })
  if (!visible) return null
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
      <torusGeometry args={[1.9, 0.03, 8, 80]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
    </mesh>
  )
}

// Wrapper for each object in the scene
function SceneObject({ obj, isSelected, isIsolated, onSelect, onDeselect }) {
  const [hovered, setHovered] = useState(false)
  const grpRef = useRef()

  // Fade opacity for isolate mode
  useFrame((_, dt) => {
    if (!grpRef.current) return
    const target = isIsolated === false ? 0.06 : 1
    grpRef.current.children.forEach(child => {
      child.traverse(c => {
        if (c.isMesh && c.material) {
          const curr = c.material.opacity ?? 1
          c.material.opacity = curr + (target - curr) * (1 - Math.pow(0.001, dt))
          c.material.transparent = c.material.opacity < 0.99
        }
      })
    })
  })

  return (
    <group
      ref={grpRef}
      position={obj.position || [0, 0, 0]}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={e => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default' }}
    >
      <ModelForObject
        name={obj.name}
        color={obj.color || '#a78bfa'}
        selected={isSelected}
        onClick={e => { e.stopPropagation(); isSelected ? onDeselect() : onSelect(obj.id) }}
        onPointerOver={() => {}}
        onPointerOut={() => {}}
      />

      <SelectionRing visible={isSelected} />

      {/* Label */}
      {(hovered || isSelected) && (
        <Html position={[0, 2.4, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.82)',
            border: `1px solid ${isSelected ? '#fff' : (obj.color || '#a78bfa')}`,
            borderRadius: 6,
            padding: '3px 12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: isSelected ? '#fff' : (obj.color || '#a78bfa'),
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.05em',
          }}>
            {obj.name}
            {isSelected && <span style={{ color: '#888', marginLeft: 8, fontSize: 9 }}>● SELECTED</span>}
          </div>
        </Html>
      )}
    </group>
  )
}

// Main exported Scene
export default function Scene({ objects = [], selectedId, isolateMode, onSelect, onDeselect, onCameraChange }) {
  const hasSpace = objects.some(o => /space|galaxy|black.?hole|nebula|universe|cosmos/.test((o.name||'').toLowerCase()))
  const hasOcean = objects.some(o => /ocean|water|sea|lake/.test((o.name||'').toLowerCase()))

  function CameraTracker() {
    const { camera } = useFrame ? null : {}
    useFrame(({ camera }) => {
      if (onCameraChange) onCameraChange(
        [camera.position.x, camera.position.y, camera.position.z],
        camera.position.z
      )
    })
    return null
  }

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.5, 8], fov: 48 }}
      dpr={[1, 2]}
      onPointerMissed={() => onDeselect?.()}
      gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.1 }}
    >
      <CameraTracker />

      {/* ── USER owns the camera — full free orbit ── */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.9}
        panSpeed={0.7}
        rotateSpeed={0.75}
        minDistance={2}
        maxDistance={35}
        makeDefault
        target={[0, 0, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#6688ff" />
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#ffffff" />

      {/* Background */}
      {hasSpace && <Stars radius={120} depth={70} count={5000} factor={5} fade speed={0.5} />}
      {hasOcean && <fog attach="fog" args={['#0a2040', 12, 40]} />}
      {!hasSpace && <color attach="background" args={['#05050a']} />}

      {/* Objects */}
      {objects.map(obj => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={selectedId === obj.id}
          isIsolated={isolateMode ? (selectedId === obj.id ? true : false) : null}
          onSelect={onSelect}
          onDeselect={onDeselect}
        />
      ))}

      {/* Floor grid */}
      <Floor />

      {/* Shadow catcher */}
      <ContactShadows
        position={[0, -2.18, 0]}
        opacity={0.45}
        scale={20}
        blur={2.5}
        far={5}
        color="#000033"
      />

      {/* HDRI environment for reflections */}
      <Environment preset="warehouse" />
    </Canvas>
  )
}
