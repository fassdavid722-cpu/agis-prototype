// Scene.jsx
// React Three Fiber canvas content.
// Reads the router output (the `renderer` descriptor) and shows the
// matching object. Camera transitions smoothly between objects using
// lerped animation in useFrame. Objects fade out/in with opacity.

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ---- Camera target positions per renderer ----
// Each object lives at a different spot in space; the camera flies to it.
const CAMERA_TARGETS = {
  cube: {
    position: new THREE.Vector3(0, 0.6, 5.2),
    lookAt: new THREE.Vector3(-2.2, 0, 0),
  },
  sphere: {
    position: new THREE.Vector3(0, 0.6, 5.2),
    lookAt: new THREE.Vector3(2.2, 0, 0),
  },
  home: {
    position: new THREE.Vector3(0, 0.9, 7.5),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
}

// ---- Animated camera that eases toward the active renderer's target ----
function Rig({ active }) {
  const { camera } = useThree()
  const target = useMemo(() => {
    return CAMERA_TARGETS[active] || CAMERA_TARGETS.home
  }, [active])

  const lookRef = useRef(new THREE.Vector3().copy(camera.position))
  const posRef = useRef(new THREE.Vector3().copy(camera.position))

  useFrame((_, delta) => {
    // smooth, frame-rate independent easing
    const ease = 1 - Math.pow(0.001, delta) // ~fast but smooth
    posRef.current.lerp(target.position, ease)
    lookRef.current.lerp(target.lookAt, ease)

    camera.position.copy(posRef.current)
    camera.lookAt(lookRef.current)
  })

  return null
}

// ---- A fading object wrapper ----
function FadingObject({ visible, position, color, children }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    const target = visible ? 1 : 0
    const ease = 1 - Math.pow(0.002, delta)
    const next = THREE.MathUtils.lerp(ref.current.opacity, target, ease)
    ref.current.opacity = next
    const scale = 0.6 + next * 0.4 // grows slightly as it fades in
    ref.current.parent.scale.setScalar(scale)
  })
  return (
    <group position={position}>
      <meshStandardMaterial
        ref={ref}
        color={color}
        transparent
        opacity={visible ? 1 : 0}
        roughness={0.25}
        metalness={0.35}
        emissive={color}
        emissiveIntensity={0.12}
      />
      {children}
    </group>
  )
}

// ---- The cube renderer ----
function Cube({ active }) {
  return (
    <FadingObject visible={active} position={[-2.2, 0, 0]} color="#6ea8ff">
      <boxGeometry args={[1.6, 1.6, 1.6]} />
    </FadingObject>
  )
}

// ---- The sphere renderer ----
function Sphere({ active }) {
  return (
    <FadingObject visible={active} position={[2.2, 0, 0]} color="#ff7ac6">
      <sphereGeometry args={[1.05, 64, 64]} />
    </FadingObject>
  )
}

// ---- Ambient floating particles for atmosphere ----
function Particles() {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3)
    for (let i = 0; i < 200; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2
    }
    return arr
  }, [])
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8aa0ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// ---- Public Scene component ----
export default function Scene({ active }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.9, 7.5], fov: 50 }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 8, 20]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <pointLight position={[-6, 2, -4]} intensity={0.6} color="#6ea8ff" />
      <pointLight position={[6, 2, -4]} intensity={0.6} color="#ff7ac6" />

      <Rig active={active} />

      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Cube active={active === 'cube'} />
      </Float>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Sphere active={active === 'sphere'} />
      </Float>

      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.35}
        scale={20}
        blur={2.5}
        far={6}
      />

      <Particles />
      <Environment preset="city" />
    </Canvas>
  )
}
