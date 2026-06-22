// Models.jsx — AGIS v4.0 — Real composite 3D models, no auto-spin
// Each model is a group of properly shaped, positioned parts
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── CAR ────────────────────────────────────────────────────────────────────
export function CarModel({ color = '#c0392b', selected, onClick, onPointerOver, onPointerOut }) {
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Main body — low wide box */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[3.6, 0.55, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} emissive={selected?color:'#000'} emissiveIntensity={selected?0.25:0} />
      </mesh>
      {/* Cabin / roof */}
      <mesh position={[0.1, 0.62, 0]} castShadow>
        <boxGeometry args={[1.8, 0.52, 1.42]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} emissive={selected?color:'#000'} emissiveIntensity={selected?0.25:0} />
      </mesh>
      {/* Windshield front */}
      <mesh position={[0.9, 0.55, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.62, 0.02, 1.3]} />
        <meshStandardMaterial color="#88ccff" roughness={0} metalness={0} transparent opacity={0.45} />
      </mesh>
      {/* Windshield rear */}
      <mesh position={[-0.9, 0.55, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.62, 0.02, 1.3]} />
        <meshStandardMaterial color="#88ccff" roughness={0} metalness={0} transparent opacity={0.45} />
      </mesh>
      {/* Wheels — 4 */}
      {[[-1.2, -0.15, 0.92], [1.2, -0.15, 0.92], [-1.2, -0.15, -0.92], [1.2, -0.15, -0.92]].map((p, i) => (
        <group key={i} position={p} rotation={[Math.PI/2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.28, 32]} />
            <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* Rim */}
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
            <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      <mesh position={[1.82, 0.18, 0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[1.82, 0.18, -0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      {/* Rear lights */}
      <mesh position={[-1.82, 0.18, 0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-1.82, 0.18, -0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      {/* Bumpers */}
      <mesh position={[1.85, -0.05, 0]}>
        <boxGeometry args={[0.12, 0.22, 1.5]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-1.85, -0.05, 0]}>
        <boxGeometry args={[0.12, 0.22, 1.5]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ─── DRAGON ─────────────────────────────────────────────────────────────────
export function DragonModel({ color = '#2d8c4e', selected, onClick, onPointerOver, onPointerOut }) {
  const tailRef = useRef()
  useFrame(s => { if (tailRef.current) tailRef.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.8) * 0.18 })
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} scale={0.9}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.3} emissive={selected?color:'#000'} emissiveIntensity={selected?0.3:0} />
      </mesh>
      {/* Neck */}
      <mesh position={[0.7, 0.9, 0]} rotation={[0,0,-0.7]} castShadow>
        <cylinderGeometry args={[0.32, 0.45, 1.1, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[1.3, 1.7, 0]} castShadow>
        <boxGeometry args={[0.85, 0.55, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Snout */}
      <mesh position={[1.75, 1.6, 0]}>
        <boxGeometry args={[0.5, 0.32, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Eye L */}
      <mesh position={[1.45, 1.84, 0.22]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={1.2} />
      </mesh>
      {/* Eye R */}
      <mesh position={[1.45, 1.84, -0.22]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={1.2} />
      </mesh>
      {/* Wing L */}
      <mesh position={[0.2, 0.7, 1.2]} rotation={[0.3, 0, 0.4]}>
        <boxGeometry args={[1.3, 0.06, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent opacity={0.8} />
      </mesh>
      {/* Wing R */}
      <mesh position={[0.2, 0.7, -1.2]} rotation={[-0.3, 0, -0.4]}>
        <boxGeometry args={[1.3, 0.06, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent opacity={0.8} />
      </mesh>
      {/* Tail */}
      <group ref={tailRef} position={[-0.9, -0.3, 0]}>
        <mesh position={[-0.6, 0, 0]} rotation={[0,0,0.3]}>
          <cylinderGeometry args={[0.15, 0.28, 1.2, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh position={[-1.4, -0.2, 0]} rotation={[0,0,0.5]}>
          <cylinderGeometry args={[0.05, 0.15, 1.0, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      </group>
      {/* Legs */}
      {[[-0.4,-1.0,0.55],[-0.4,-1.0,-0.55],[0.4,-0.85,0.5],[0.4,-0.85,-0.5]].map((p,i)=>(
        <mesh key={i} position={p} rotation={[0,0, i<2?0.3:-0.2]}>
          <cylinderGeometry args={[0.14, 0.1, 0.7, 10]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── DNA HELIX ───────────────────────────────────────────────────────────────
export function DNAModel({ color = '#00e5ff', selected, onClick, onPointerOver, onPointerOut }) {
  const points = []
  const N = 32
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 4 - Math.PI * 2
    const y = (i / N) * 5 - 2.5
    points.push([Math.cos(t) * 0.9, y, Math.sin(t) * 0.9])
  }
  const points2 = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 4 - Math.PI * 2 + Math.PI
    const y = (i / N) * 5 - 2.5
    points2.push([Math.cos(t) * 0.9, y, Math.sin(t) * 0.9])
  }
  const rungCount = 12
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {points.map((p, i) => i < N - 1 && (
        <mesh key={`s1-${i}`} position={[(p[0]+points[i+1][0])/2, (p[1]+points[i+1][1])/2, (p[2]+points[i+1][2])/2]}>
          <sphereGeometry args={[0.085, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.6} emissive={selected?color:'#003344'} emissiveIntensity={selected?0.8:0.3} />
        </mesh>
      ))}
      {points2.map((p, i) => i < N - 1 && (
        <mesh key={`s2-${i}`} position={[(p[0]+points2[i+1][0])/2, (p[1]+points2[i+1][1])/2, (p[2]+points2[i+1][2])/2]}>
          <sphereGeometry args={[0.085, 8, 8]} />
          <meshStandardMaterial color="#ff4088" emissive="#ff0055" emissiveIntensity={0.3} roughness={0.2} metalness={0.6} />
        </mesh>
      ))}
      {/* Rungs */}
      {Array.from({length: rungCount}, (_, i) => {
        const t = (i / rungCount) * Math.PI * 4 - Math.PI * 2
        const y = (i / rungCount) * 5 - 2.5
        const x1 = Math.cos(t) * 0.9, z1 = Math.sin(t) * 0.9
        const x2 = Math.cos(t + Math.PI) * 0.9, z2 = Math.sin(t + Math.PI) * 0.9
        const mx = (x1+x2)/2, mz = (z1+z2)/2
        const len = Math.sqrt((x2-x1)**2+(z2-z1)**2)
        const angle = Math.atan2(z2-z1, x2-x1)
        return (
          <mesh key={`r-${i}`} position={[mx, y, mz]} rotation={[0, -angle, Math.PI/2]}>
            <cylinderGeometry args={[0.04, 0.04, len, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} transparent opacity={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── SOLAR SYSTEM ───────────────────────────────────────────────────────────
export function SolarSystemModel({ selected, onClick, onPointerOver, onPointerOut }) {
  const earthRef = useRef(), marsRef = useRef(), jupRef = useRef()
  useFrame(s => {
    const t = s.clock.elapsedTime
    if (earthRef.current) { earthRef.current.position.x = Math.cos(t*0.5)*3.5; earthRef.current.position.z = Math.sin(t*0.5)*3.5 }
    if (marsRef.current)  { marsRef.current.position.x  = Math.cos(t*0.3)*5.2; marsRef.current.position.z  = Math.sin(t*0.3)*5.2 }
    if (jupRef.current)   { jupRef.current.position.x   = Math.cos(t*0.15)*7.5; jupRef.current.position.z   = Math.sin(t*0.15)*7.5 }
  })
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Sun */}
      <mesh castShadow>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff8800" emissiveIntensity={1.2} roughness={1} metalness={0} />
      </mesh>
      <pointLight position={[0,0,0]} intensity={3} color="#ffaa44" distance={20} />
      {/* Orbit rings */}
      {[3.5, 5.2, 7.5].map((r, i) => (
        <mesh key={i} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[r, 0.015, 8, 120]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        </mesh>
      ))}
      {/* Earth */}
      <group ref={earthRef} position={[3.5,0,0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial color="#2277ee" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Moon */}
        <mesh position={[0.7, 0, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.9} />
        </mesh>
      </group>
      {/* Mars */}
      <group ref={marsRef} position={[5.2,0,0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color="#cc4411" roughness={0.85} metalness={0.05} />
        </mesh>
      </group>
      {/* Jupiter */}
      <group ref={jupRef} position={[7.5,0,0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial color="#d4a96a" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Saturn-style ring for Jupiter just for looks */}
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[1.0, 0.06, 8, 80]} />
          <meshStandardMaterial color="#c8aa88" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── HUMAN BRAIN ────────────────────────────────────────────────────────────
export function BrainModel({ color = '#e87ca0', selected, onClick, onPointerOver, onPointerOut }) {
  const pulseRef = useRef()
  useFrame(s => {
    if (pulseRef.current) {
      const sc = 1 + Math.sin(s.clock.elapsedTime * 1.1) * 0.025
      pulseRef.current.scale.setScalar(sc)
    }
  })
  return (
    <group ref={pulseRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Left hemisphere */}
      <mesh position={[-0.38, 0, 0]} castShadow>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} emissive={selected?color:'#000'} emissiveIntensity={selected?0.2:0} />
      </mesh>
      {/* Right hemisphere */}
      <mesh position={[0.38, 0, 0]} castShadow>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} emissive={selected?color:'#000'} emissiveIntensity={selected?0.2:0} />
      </mesh>
      {/* Cerebellum */}
      <mesh position={[0, -0.7, -0.6]} castShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#d46090" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Brain stem */}
      <mesh position={[0, -1.2, -0.3]}>
        <cylinderGeometry args={[0.15, 0.12, 0.6, 16]} />
        <meshStandardMaterial color="#c85080" roughness={0.9} />
      </mesh>
      {/* Folds — decorative ridges */}
      {[-0.4,-0.2,0,0.2,0.4].map((x,i) => (
        <mesh key={i} position={[x, 0.5, 0.6]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.35, 0.055, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#c06080" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── BLACK HOLE ─────────────────────────────────────────────────────────────
export function BlackHoleModel({ selected, onClick, onPointerOver, onPointerOut }) {
  const discRef = useRef()
  useFrame(s => { if (discRef.current) discRef.current.rotation.z += 0.008 })
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Event horizon */}
      <mesh castShadow>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial color="#000000" roughness={0} metalness={1} emissive="#000" />
      </mesh>
      {/* Photon sphere glow */}
      <mesh>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshStandardMaterial color="#ff8800" transparent opacity={0.12} emissive="#ff4400" emissiveIntensity={0.8} wireframe />
      </mesh>
      {/* Accretion disk */}
      <group ref={discRef} rotation={[0.35, 0, 0]}>
        {[1.1, 1.5, 1.9, 2.3, 2.7].map((r, i) => (
          <mesh key={i} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[r, 0.08 - i*0.01, 8, 120]} />
            <meshStandardMaterial
              color={i < 2 ? '#ff6600' : i < 4 ? '#ffaa00' : '#ffdd88'}
              emissive={i < 2 ? '#ff3300' : i < 4 ? '#ff8800' : '#ffcc00'}
              emissiveIntensity={1.4 - i*0.2}
              transparent opacity={0.85 - i*0.1}
            />
          </mesh>
        ))}
      </group>
      {/* Jets */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.04, 0.2, 1.8, 12]} />
        <meshStandardMaterial color="#8888ff" emissive="#4444ff" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, -2.2, 0]} rotation={[Math.PI,0,0]}>
        <cylinderGeometry args={[0.04, 0.2, 1.8, 12]} />
        <meshStandardMaterial color="#8888ff" emissive="#4444ff" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// ─── HUMAN FIGURE ───────────────────────────────────────────────────────────
export function HumanModel({ color = '#f0c090', selected, onClick, onPointerOver, onPointerOut }) {
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} scale={0.75}>
      {/* Head */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.0} emissive={selected?color:'#000'} emissiveIntensity={selected?0.2:0} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.35, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.85, 1.1, 0.42]} />
        <meshStandardMaterial color="#3355cc" roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Hips */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.78, 0.38, 0.4]} />
        <meshStandardMaterial color="#223388" roughness={0.8} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.68, 1.2, 0]} rotation={[0,0,0.18]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 1.0, 12]} />
        <meshStandardMaterial color="#3355cc" roughness={0.8} />
      </mesh>
      <mesh position={[-0.82, 0.58, 0]} rotation={[0,0,0.08]}>
        <cylinderGeometry args={[0.09, 0.08, 0.85, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.68, 1.2, 0]} rotation={[0,0,-0.18]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 1.0, 12]} />
        <meshStandardMaterial color="#3355cc" roughness={0.8} />
      </mesh>
      <mesh position={[0.82, 0.58, 0]} rotation={[0,0,-0.08]}>
        <cylinderGeometry args={[0.09, 0.08, 0.85, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.25, -0.28, 0]} rotation={[0,0,0.06]} castShadow>
        <cylinderGeometry args={[0.16, 0.13, 1.0, 14]} />
        <meshStandardMaterial color="#223388" roughness={0.8} />
      </mesh>
      <mesh position={[-0.27, -1.28, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 1.0, 14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.25, -0.28, 0]} rotation={[0,0,-0.06]} castShadow>
        <cylinderGeometry args={[0.16, 0.13, 1.0, 14]} />
        <meshStandardMaterial color="#223388" roughness={0.8} />
      </mesh>
      <mesh position={[0.27, -1.28, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 1.0, 14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.27, -1.85, 0.1]}>
        <boxGeometry args={[0.22, 0.12, 0.45]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[0.27, -1.85, 0.1]}>
        <boxGeometry args={[0.22, 0.12, 0.45]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── ROBOT ───────────────────────────────────────────────────────────────────
export function RobotModel({ color = '#4488cc', selected, onClick, onPointerOver, onPointerOut }) {
  const eyeRef = useRef()
  useFrame(s => { if (eyeRef.current) eyeRef.current.intensity = 0.8 + Math.sin(s.clock.elapsedTime*3)*0.4 })
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} scale={0.8}>
      {/* Head */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[0.75, 0.65, 0.68]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} emissive={selected?color:'#000'} emissiveIntensity={selected?0.3:0} />
      </mesh>
      {/* Eye visor */}
      <mesh position={[0, 2.42, 0.35]}>
        <boxGeometry args={[0.55, 0.14, 0.05]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[1.0, 1.1, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Chest panel */}
      <mesh position={[0, 1.5, 0.36]}>
        <boxGeometry args={[0.6, 0.5, 0.04]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.9} />
      </mesh>
      {/* Chest light */}
      <mesh position={[0, 1.5, 0.4]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
      {/* Hips */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.9, 0.32, 0.65]} />
        <meshStandardMaterial color="#334466" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Arms */}
      {[[-0.68,1.55],[ 0.68,1.55]].map(([x,y], i) => (
        <group key={i}>
          <mesh position={[x, y, 0]} rotation={[0,0,i===0?0.2:-0.2]} castShadow>
            <boxGeometry args={[0.28, 0.9, 0.28]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
          </mesh>
          <mesh position={[x*1.05, y-0.7, 0]}>
            <boxGeometry args={[0.24, 0.7, 0.24]} />
            <meshStandardMaterial color="#334466" roughness={0.25} metalness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Legs */}
      {[[-0.28,0.1],[0.28,0.1]].map(([x,y],i) => (
        <group key={i}>
          <mesh position={[x, y-0.5, 0]} castShadow>
            <boxGeometry args={[0.32, 0.85, 0.32]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
          </mesh>
          <mesh position={[x, y-1.3, 0]}>
            <boxGeometry args={[0.28, 0.8, 0.28]} />
            <meshStandardMaterial color="#334466" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Foot */}
          <mesh position={[x, y-1.78, 0.1]}>
            <boxGeometry args={[0.34, 0.18, 0.5]} />
            <meshStandardMaterial color="#222" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── TREE ────────────────────────────────────────────────────────────────────
export function TreeModel({ color = '#2d8c2d', selected, onClick, onPointerOver, onPointerOut }) {
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Trunk */}
      <mesh position={[0, -1.0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 1.8, 12]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.95} metalness={0} />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <coneGeometry args={[1.5, 2.2, 10]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0} emissive={selected?color:'#000'} emissiveIntensity={selected?0.25:0} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[1.1, 1.8, 10]} />
        <meshStandardMaterial color="#3aaa3a" roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.7, 1.4, 10]} />
        <meshStandardMaterial color="#44cc44" roughness={0.85} metalness={0} />
      </mesh>
      {/* Roots */}
      {[-0.3,0,0.3].map((x,i)=>(
        <mesh key={i} position={[x, -1.85, 0]} rotation={[0,0,(-0.3+i*0.3)]}>
          <cylinderGeometry args={[0.05, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#7a4a2a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ─── PLANET / EARTH ──────────────────────────────────────────────────────────
export function PlanetModel({ color = '#2277ee', name='earth', selected, onClick, onPointerOver, onPointerOut }) {
  const rotRef = useRef()
  useFrame(s => { if (rotRef.current) rotRef.current.rotation.y += 0.003 })
  const hasSaturnRing = /saturn/.test((name||'').toLowerCase())
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <group ref={rotRef}>
        <mesh castShadow>
          <sphereGeometry args={[1.2, 48, 48]} />
          <meshStandardMaterial color={color} roughness={0.65} metalness={0.1} emissive={selected?color:'#000'} emissiveIntensity={selected?0.2:0} />
        </mesh>
        {/* Land masses (decorative) */}
        {[[0.3,0.4,0.9],[-0.4,0.2,1.0],[0.7,-0.2,0.7]].map((p,i)=>(
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.28+i*0.06, 12, 12]} />
            <meshStandardMaterial color="#44aa44" roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.28, 32, 32]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.12} roughness={1} />
      </mesh>
      {hasSaturnRing && (
        <mesh rotation={[0.3, 0, 0]}>
          <torusGeometry args={[2.2, 0.45, 4, 120]} />
          <meshStandardMaterial color="#d4bb88" transparent opacity={0.7} roughness={0.8} />
        </mesh>
      )}
    </group>
  )
}

// ─── SWORD ───────────────────────────────────────────────────────────────────
export function SwordModel({ color = '#aaddff', selected, onClick, onPointerOver, onPointerOut }) {
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} rotation={[0,0,0.3]}>
      {/* Blade */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.08, 2.4, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={1.0} emissive={selected?color:'#000'} emissiveIntensity={selected?0.5:0} />
      </mesh>
      {/* Blade taper at tip */}
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[0.04, 0.3, 4]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={1.0} />
      </mesh>
      {/* Guard */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.65, 0.1, 0.12]} />
        <meshStandardMaterial color="#gold" color="#ffd700" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 1.0, 14]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -1.05, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

// ─── ATOM ────────────────────────────────────────────────────────────────────
export function AtomModel({ color = '#00e5ff', selected, onClick, onPointerOver, onPointerOut }) {
  const orb1 = useRef(), orb2 = useRef(), orb3 = useRef()
  useFrame(s => {
    const t = s.clock.elapsedTime
    if (orb1.current) { orb1.current.position.x = Math.cos(t*1.1)*1.4; orb1.current.position.z = Math.sin(t*1.1)*1.4 }
    if (orb2.current) { orb2.current.position.x = Math.cos(t*0.8+2)*1.4; orb2.current.position.y = Math.sin(t*0.8+2)*1.4 }
    if (orb3.current) { orb3.current.position.y = Math.cos(t*1.3+4)*1.4; orb3.current.position.z = Math.sin(t*1.3+4)*1.4 }
  })
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Nucleus */}
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.8} roughness={0.4} />
      </mesh>
      {/* Orbital rings */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.4, 0.025, 8, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.4, 0.025, 8, 100]} />
        <meshBasicMaterial color="#ff88ff" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0, Math.PI/3, Math.PI/3]}>
        <torusGeometry args={[1.4, 0.025, 8, 100]} />
        <meshBasicMaterial color="#88ffaa" transparent opacity={0.4} />
      </mesh>
      {/* Electrons */}
      <mesh ref={orb1}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={orb2}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#ff88ff" emissive="#ff44ff" emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={orb3}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#88ffaa" emissive="#44ff88" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

// ─── BUILDING / SKYSCRAPER ───────────────────────────────────────────────────
export function BuildingModel({ color = '#667799', selected, onClick, onPointerOver, onPointerOut }) {
  return (
    <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Main tower */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.2, 4.2, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} emissive={selected?color:'#000'} emissiveIntensity={selected?0.2:0} />
      </mesh>
      {/* Mid section */}
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[0.9, 1.5, 0.9]} />
        <meshStandardMaterial color="#889aaa" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, 5.4, 0]}>
        <cylinderGeometry args={[0.05, 0.2, 1.2, 8]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Windows */}
      {[-0.3,0,0.3].flatMap(x => [-0.5,0,0.5,1.0,1.5,2.0].map(y => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.62]}>
          <boxGeometry args={[0.18, 0.22, 0.02]} />
          <meshStandardMaterial color="#ffeeaa" emissive="#ffcc44" emissiveIntensity={0.4} />
        </mesh>
      )))}
      {/* Base */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[1.8, 0.25, 1.8]} />
        <meshStandardMaterial color="#445566" roughness={0.6} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ─── GENERIC FALLBACK — still looks good ────────────────────────────────────
export function GenericModel({ name, color = '#a78bfa', selected, onClick, onPointerOver, onPointerOut }) {
  const ref = useRef()
  // Very slow idle rotation — barely perceptible, object feels "alive" not spinning
  useFrame(s => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.25) * 0.15 })
  return (
    <group ref={ref} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <mesh castShadow>
        <icosahedronGeometry args={[1.0, 3]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={selected ? 0.4 : 0.1}
          wireframe={false}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.18} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// ─── Model picker ─────────────────────────────────────────────────────────────
export function ModelForObject({ name, color, selected, onClick, onPointerOver, onPointerOut }) {
  const n = (name || '').toLowerCase()
  const props = { color, selected, onClick, onPointerOver, onPointerOut }
  if (/\bcar\b|vehicle|truck|suv|sedan/.test(n))        return <CarModel {...props} />
  if (/dragon|wyvern|drake/.test(n))                     return <DragonModel {...props} />
  if (/dna|helix/.test(n))                               return <DNAModel {...props} />
  if (/solar.?system|solar system/.test(n))              return <SolarSystemModel {...props} />
  if (/brain|neural|neuron|cortex/.test(n))              return <BrainModel {...props} />
  if (/black.?hole|singularity|accretion/.test(n))       return <BlackHoleModel {...props} />
  if (/human|person|man|woman|figure|body/.test(n))      return <HumanModel {...props} />
  if (/robot|android|cyborg|mech/.test(n))               return <RobotModel {...props} />
  if (/tree|forest|pine|oak|jungle/.test(n))             return <TreeModel {...props} />
  if (/planet|earth|mars|saturn|jupiter|moon/.test(n))   return <PlanetModel {...props} name={name} />
  if (/sword|blade|katana|dagger/.test(n))               return <SwordModel {...props} />
  if (/atom|electron|molecule|nucleus/.test(n))          return <AtomModel {...props} />
  if (/building|skyscraper|tower|city|eiffel/.test(n))   return <BuildingModel {...props} />
  return <GenericModel {...props} name={name} />
}
