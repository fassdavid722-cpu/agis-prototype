// Scene.jsx — AGIS v3.0 — Interactive visual workspace
// Full orbit controls, clickable objects, isolate mode, modifications
import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles, ContactShadows, Environment, Float, Html } from '@react-three/drei'
import * as THREE from 'three'

// ── Semantic geometry picker ─────────────────────────────────────────────────
export function pickGeometry(name) {
  const n = (name || '').toLowerCase()
  if (/face|head|human|person|skull|portrait|eye|iris/.test(n))     return { type: 'sphere', args: [1.1, 64, 64] }
  if (/dna|helix|spiral|coil|spring/.test(n))                        return { type: 'torusKnot', args: [0.8, 0.22, 200, 20, 2, 3] }
  if (/planet|moon|earth|mars|jupiter|saturn|star\b|sun|asteroid/.test(n)) return { type: 'sphere', args: [1.0, 64, 64] }
  if (/black.?hole|wormhole|vortex|singularity/.test(n))             return { type: 'torus', args: [1.1, 0.55, 48, 200] }
  if (/dragon|creature|beast|monster|dinosaur/.test(n))              return { type: 'octahedron', args: [1.2, 2] }
  if (/crystal|gem|diamond|jewel|prism/.test(n))                     return { type: 'octahedron', args: [1.0, 0] }
  if (/brain|neural|neuron|synapse|mind|network/.test(n))            return { type: 'torusKnot', args: [0.7, 0.3, 256, 16, 3, 5] }
  if (/heart/.test(n))                                               return { type: 'sphere', args: [1.0, 32, 32] }
  if (/tree|forest|plant|leaf|flower/.test(n))                       return { type: 'cone', args: [0.9, 2.4, 6] }
  if (/mountain|terrain|volcano|cliff|hill|peak|pyramid/.test(n))   return { type: 'cone', args: [1.4, 2.2, 4] }
  if (/ocean|water|wave|sea|lake|river/.test(n))                     return { type: 'plane', args: [5, 5, 32, 32] }
  if (/city|building|skyscraper|tower|eiffel|column/.test(n))        return { type: 'box', args: [0.8, 2.8, 0.8] }
  if (/galaxy|universe|cosmos|nebula/.test(n))                       return { type: 'sphere', args: [1.5, 32, 32] }
  if (/robot|machine|android|cyborg|mech/.test(n))                   return { type: 'box', args: [1.2, 1.8, 1.0] }
  if (/engine|piston|motor|cylinder\b/.test(n))                      return { type: 'cylinder', args: [0.5, 0.5, 1.4, 32] }
  if (/wheel|tire|ring|band|loop|hoop|torus/.test(n))                return { type: 'torus', args: [0.9, 0.3, 32, 100] }
  if (/sword|blade|knife|weapon|gun|rifle/.test(n))                  return { type: 'cylinder', args: [0.06, 0.06, 2.8, 12] }
  if (/fire|flame|explosion|lava|magma/.test(n))                     return { type: 'cone', args: [0.8, 2.0, 32] }
  if (/atom|molecule|cell|electron|proton|nucleus/.test(n))          return { type: 'icosahedron', args: [1.0, 1] }
  if (/clock|watch|hourglass|time/.test(n))                          return { type: 'torus', args: [1.0, 0.12, 16, 100] }
  if (/car|vehicle|truck|bus|chassis|body/.test(n))                  return { type: 'box', args: [2.0, 0.7, 1.0] }
  if (/cube|box|block/.test(n))                                       return { type: 'box', args: [1.6, 1.6, 1.6] }
  if (/sphere|ball|globe/.test(n))                                    return { type: 'sphere', args: [1.0, 64, 64] }
  if (/cone/.test(n))                                                  return { type: 'cone', args: [0.9, 2.0, 32] }
  return { type: 'icosahedron', args: [1.0, 2] }
}

function makeGeo(g) {
  switch (g.type) {
    case 'box':          return <boxGeometry args={g.args} />
    case 'sphere':       return <sphereGeometry args={g.args} />
    case 'torus':        return <torusGeometry args={g.args} />
    case 'torusKnot':    return <torusKnotGeometry args={g.args} />
    case 'cone':         return <coneGeometry args={g.args} />
    case 'cylinder':     return <cylinderGeometry args={g.args} />
    case 'octahedron':   return <octahedronGeometry args={g.args} />
    case 'icosahedron':  return <icosahedronGeometry args={g.args} />
    case 'plane':        return <planeGeometry args={g.args} />
    default:             return <icosahedronGeometry args={[1, 2]} />
  }
}

// ── Single selectable object ─────────────────────────────────────────────────
function SceneObject({ obj, isSelected, isIsolated, onSelect, onDeselect }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const geo = useMemo(() => pickGeometry(obj.name), [obj.name])
  const isOcean = /ocean|water|wave|sea|lake/.test((obj.name || '').toLowerCase())

  // Wave animation for ocean
  const geoRef = useRef()
  useFrame((state, dt) => {
    if (!meshRef.current) return
    // Spin if animate intent
    if (obj.spin) meshRef.current.rotation.y += dt * 0.5
    // Breathing for organic
    if (obj.breathe) {
      const t = state.clock.elapsedTime
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04)
    }
    // Ocean waves
    if (isOcean && geoRef.current) {
      const pos = geoRef.current.attributes.position
      const t = state.clock.elapsedTime
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i)
        pos.setY(i, Math.sin(x * 1.5 + t) * 0.3 + Math.cos(z * 1.2 + t * 0.8) * 0.2)
      }
      pos.needsUpdate = true
      geoRef.current.computeVertexNormals()
    }
  })

  // Opacity based on isolate mode
  const targetOpacity = isIsolated === false ? 0.08 : 1
  const opacityRef = useRef(1)
  useFrame((_, dt) => {
    if (!meshRef.current?.material) return
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 1 - Math.pow(0.001, dt))
    meshRef.current.material.opacity = opacityRef.current
    meshRef.current.material.transparent = opacityRef.current < 1
  })

  const color = obj.color || '#6ea8ff'
  const isGlass = /crystal|gem|diamond|glass|lens/.test((obj.name || '').toLowerCase())
  const isMetal = /metal|robot|machine|chrome|steel/.test((obj.name || '').toLowerCase())
  const isFire  = /fire|flame|lava|sun/.test((obj.name || '').toLowerCase())
  const isGalaxy = /galaxy|nebula|universe|cosmos/.test((obj.name || '').toLowerCase())

  const matProps = {
    roughness:  isGlass ? 0.0 : isMetal ? 0.1 : isFire ? 0.8 : 0.3,
    metalness:  isMetal ? 0.95 : isGlass ? 0.0 : 0.35,
    emissive:   color,
    emissiveIntensity: isSelected ? 0.55 : hovered ? 0.35 : isFire ? 0.9 : 0.18,
    transparent: isGlass || isIsolated === false,
    opacity: 1,
  }

  return (
    <group position={obj.position || [0, 0, 0]}>
      <mesh
        ref={meshRef}
        rotation={isOcean ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={e => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default' }}
        onClick={e => { e.stopPropagation(); isSelected ? onDeselect() : onSelect(obj.id) }}
      >
        {isOcean
          ? <planeGeometry ref={geoRef} args={[5, 5, 32, 32]} />
          : makeGeo(geo)
        }
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.55, 0.025, 12, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Hover ring */}
      {hovered && !isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.52, 0.015, 8, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
      )}

      {/* Label on hover */}
      {(hovered || isSelected) && (
        <Html position={[0, 2.0, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: `1px solid ${isSelected ? '#fff' : color}`,
            borderRadius: 6,
            padding: '3px 10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: isSelected ? '#fff' : color,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
          }}>
            {obj.name}
            {isSelected && <span style={{ color: '#888', marginLeft: 8, fontSize: 9 }}>SELECTED</span>}
          </div>
        </Html>
      )}

      {isFire && isSelected && <Sparkles count={60} size={3} speed={1.5} color={color} scale={2.5} />}
      {isGalaxy && <Sparkles count={200} size={1.5} speed={0.3} color={color} scale={5} />}
    </group>
  )
}

// ── Main Scene ───────────────────────────────────────────────────────────────
export default function Scene({ objects, selectedId, isolateMode, onSelect, onDeselect, onCameraChange }) {
  const controlsRef = useRef()

  function CameraTracker() {
    const { camera } = useThree()
    useFrame(() => {
      if (onCameraChange) {
        onCameraChange(
          [camera.position.x, camera.position.y, camera.position.z],
          camera.position.z
        )
      }
    })
    return null
  }

  const isSpace = objects.some(o => /space|galaxy|black.?hole|nebula|universe|cosmos|star/.test((o.name || '').toLowerCase()))
  const isOcean = objects.some(o => /ocean|water|wave|sea/.test((o.name || '').toLowerCase()))

  return (
    <Canvas
      camera={{ position: [0, 1.2, 7], fov: 52 }}
      dpr={[1, 2]}
      onPointerMissed={() => onDeselect && onDeselect()}
    >
      <CameraTracker />

      {/* FREE orbit controls — user owns the camera */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.8}
        panSpeed={0.6}
        rotateSpeed={0.7}
        minDistance={1.5}
        maxDistance={30}
        makeDefault
      />

      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.7} color="#5580ff" />
      {objects.map(o => (
        <pointLight key={`pl-${o.id}`} position={[0, -2, 2]} intensity={0.35} color={o.color || '#6ea8ff'} />
      ))}

      {isSpace && <Stars radius={100} depth={60} count={4000} factor={5} fade speed={0.6} />}
      {isOcean && <fog attach="fog" args={['#1a4a6b', 10, 35]} />}

      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3} floatingRange={[-0.08, 0.08]}>
        {objects.map(obj => (
          <SceneObject
            key={obj.id}
            obj={obj}
            isSelected={selectedId === obj.id}
            isIsolated={isolateMode ? selectedId === obj.id : null}
            onSelect={onSelect}
            onDeselect={onDeselect}
          />
        ))}
      </Float>

      <ContactShadows opacity={0.22} scale={16} blur={3} far={10} position={[0, -2.2, 0]} />
      <Environment preset="city" />
    </Canvas>
  )
}
