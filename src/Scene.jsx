// Scene.jsx — AGIS v2.0
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment, ContactShadows, Stars, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

const CAM = {
  cube:       { pos: [0, 0.6, 5.2],  look: [-2.2, 0, 0] },
  sphere:     { pos: [0, 0.6, 5.2],  look: [2.2, 0, 0]  },
  torus:      { pos: [0, 0.8, 5.8],  look: [0, 0, 0]    },
  cylinder:   { pos: [0, 0.6, 5.2],  look: [-1.5, 0, 0] },
  cone:       { pos: [0, 0.6, 5.2],  look: [1.5, 0, 0]  },
  plane:      { pos: [0, 4, 2],      look: [0, 0, 0]    },
  octahedron: { pos: [0, 0.6, 5.2],  look: [0, 0.5, 0]  },
  star:       { pos: [0, 0.6, 5.5],  look: [0, 0, 0]    },
  environment:{ pos: [0, 0.9, 7.5],  look: [0, 0, 0]    },
  home:       { pos: [0, 0.9, 7.5],  look: [0, 0, 0]    },
}

function Rig({ renderer }) {
  const { camera } = useThree()
  const t = CAM[renderer] || CAM.home
  const posTarget = useMemo(() => new THREE.Vector3(...t.pos), [renderer])
  const lookTarget = useMemo(() => new THREE.Vector3(...t.look), [renderer])
  const posRef = useRef(new THREE.Vector3().copy(camera.position))
  const lookRef = useRef(new THREE.Vector3(0, 0, 0))
  useFrame((_, dt) => {
    const e = 1 - Math.pow(0.001, dt)
    posRef.current.lerp(posTarget, e)
    lookRef.current.lerp(lookTarget, e)
    camera.position.copy(posRef.current)
    camera.lookAt(lookRef.current)
  })
  return null
}

function FadeMesh({ visible, position, color, geo, spin }) {
  const matRef = useRef()
  const grpRef = useRef()
  useFrame((state, dt) => {
    if (!matRef.current || !grpRef.current) return
    const e = 1 - Math.pow(0.002, dt)
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, visible ? 1 : 0, e)
    matRef.current.transparent = true
    const s = 0.5 + matRef.current.opacity * 0.5
    grpRef.current.scale.setScalar(s)
    if (spin) grpRef.current.rotation.y += dt * 0.5
  })
  return (
    <group ref={grpRef} position={position}>
      <mesh>
        {geo}
        <meshStandardMaterial ref={matRef} color={color} transparent opacity={0} roughness={0.22} metalness={0.4} emissive={color} emissiveIntensity={0.18} />
      </mesh>
    </group>
  )
}

function StarField({ visible }) {
  return visible ? <Stars radius={80} depth={50} count={3000} factor={5} fade speed={1} /> : null
}

export default function Scene({ descriptor }) {
  const r = descriptor?.renderer || null
  const color = descriptor?.color || '#ffffff'
  const intent = descriptor?.intent || 'show'
  const spin = intent === 'rotate' || intent === 'animate'

  return (
    <Canvas camera={{ position: [0, 0.9, 7.5], fov: 52 }} dpr={[1, 2]}>
      <Rig renderer={r} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#5580ff" />

      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
        <FadeMesh visible={r === 'cube'}       position={[-2.2,0,0]} color={color} geo={<boxGeometry args={[1.6,1.6,1.6]} />} spin={spin} />
        <FadeMesh visible={r === 'sphere'}     position={[2.2,0,0]}  color={color} geo={<sphereGeometry args={[0.9,64,64]} />} spin={spin} />
        <FadeMesh visible={r === 'torus'}      position={[0,0,0]}    color={color} geo={<torusGeometry args={[0.9,0.35,32,100]} />} spin={spin} />
        <FadeMesh visible={r === 'cylinder'}   position={[-1.5,0,0]} color={color} geo={<cylinderGeometry args={[0.7,0.7,2,64]} />} spin={spin} />
        <FadeMesh visible={r === 'cone'}       position={[1.5,0,0]}  color={color} geo={<coneGeometry args={[0.8,2,64]} />} spin={spin} />
        <FadeMesh visible={r === 'plane'}      position={[0,-0.5,0]} color={color} geo={<planeGeometry args={[4,4,10,10]} />} spin={false} />
        <FadeMesh visible={r === 'octahedron'} position={[0,0.5,0]}  color={color} geo={<octahedronGeometry args={[1.1]} />} spin={spin} />
        <FadeMesh visible={r === 'star'}       position={[0,0,0]}    color={color} geo={<sphereGeometry args={[0.6,8,8]} />} spin={spin} />
      </Float>

      <StarField visible={r === 'environment' && descriptor?.object === 'space'} />

      <ContactShadows opacity={0.3} scale={12} blur={2.5} far={6} position={[0,-1.5,0]} />
      <Environment preset="city" />
    </Canvas>
  )
}
