// Scene.jsx — AGIS v2.1 — Universal renderer, no hardcoded object limits
import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment, ContactShadows, Stars, Trail, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// ── Camera ──────────────────────────────────────────────────────────────────
function Rig({ targetPos, targetLook }) {
  const { camera } = useThree()
  const posRef = useRef(camera.position.clone())
  const lookRef = useRef(new THREE.Vector3(0, 0, 0))
  const tPos = useMemo(() => new THREE.Vector3(...targetPos), [targetPos.join(',')])
  const tLook = useMemo(() => new THREE.Vector3(...targetLook), [targetLook.join(',')])
  useFrame((_, dt) => {
    const e = 1 - Math.pow(0.001, dt)
    posRef.current.lerp(tPos, e)
    lookRef.current.lerp(tLook, e)
    camera.position.copy(posRef.current)
    camera.lookAt(lookRef.current)
  })
  return null
}

// ── Fade wrapper ─────────────────────────────────────────────────────────────
function Fader({ visible, children }) {
  const grpRef = useRef()
  useFrame((_, dt) => {
    if (!grpRef.current) return
    const e = 1 - Math.pow(0.003, dt)
    grpRef.current.children.forEach(c => {
      if (c.material) {
        c.material.opacity = THREE.MathUtils.lerp(c.material.opacity, visible ? 1 : 0, e)
        const s = 0.4 + c.material.opacity * 0.6
        c.parent.scale.setScalar(s)
      }
    })
  })
  return <group ref={grpRef}>{children}</group>
}

// ── Universal mesh – renders any object as a meaningful 3D shape ─────────────
function UniversalMesh({ descriptor }) {
  const grpRef = useRef()
  const color = descriptor?.color || '#6ea8ff'
  const object = (descriptor?.object || '').toLowerCase()
  const intent = descriptor?.intent || 'show'
  const animate = intent !== 'hide'

  useFrame((state, dt) => {
    if (!grpRef.current || !animate) return
    const t = state.clock.elapsedTime
    // Gentle auto rotation
    grpRef.current.rotation.y += dt * 0.5
    // Breathing scale for organic objects
    if (['human','face','animal','creature','dragon','monster'].some(w => object.includes(w))) {
      grpRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04)
    }
  })

  // --- Pick geometry based on object semantics ---
  const geo = useMemo(() => {
    // Faces / heads
    if (/face|head|human|person|skull|portrait/.test(object))
      return <sphereGeometry args={[1.1, 64, 64]} />
    // DNA / helix / spiral
    if (/dna|helix|spiral|coil|spring/.test(object))
      return <torusKnotGeometry args={[0.8, 0.22, 200, 20, 2, 3]} />
    // Solar system / planet / moon / asteroid
    if (/solar|planet|moon|earth|mars|jupiter|saturn|asteroid/.test(object))
      return <sphereGeometry args={[1.0, 64, 64]} />
    // Black hole / wormhole / vortex
    if (/black.?hole|wormhole|vortex|singularity/.test(object))
      return <torusGeometry args={[1.1, 0.55, 48, 200]} />
    // Dragon / creature / beast
    if (/dragon|creature|beast|monster|dinosaur/.test(object))
      return <octahedronGeometry args={[1.2, 2]} />
    // Crystal / gem / diamond / jewel
    if (/crystal|gem|diamond|jewel|prism/.test(object))
      return <octahedronGeometry args={[1.0, 0]} />
    // Brain / neuron / neural
    if (/brain|neural|neuron|synapse|mind/.test(object))
      return <torusKnotGeometry args={[0.7, 0.3, 256, 16, 3, 5]} />
    // Heart
    if (/heart/.test(object))
      return <sphereGeometry args={[1.0, 32, 32]} />
    // Tree / forest / nature / plant
    if (/tree|forest|nature|plant|leaf|flower/.test(object))
      return <coneGeometry args={[0.9, 2.4, 6]} />
    // Mountain / terrain / volcano / cliff
    if (/mountain|terrain|volcano|cliff|hill|peak/.test(object))
      return <coneGeometry args={[1.4, 2.2, 4]} />
    // Ocean / water / wave / sea / lake / river
    if (/ocean|water|wave|sea|lake|river/.test(object))
      return <planeGeometry args={[5, 5, 32, 32]} />
    // City / building / skyscraper / tower / architecture
    if (/city|building|skyscraper|tower|architecture|eiffel|pyramid/.test(object))
      return <boxGeometry args={[0.8, 2.8, 0.8]} />
    // Galaxy / universe / cosmos / nebula / star
    if (/galaxy|universe|cosmos|nebula|star|constellation/.test(object))
      return <sphereGeometry args={[1.5, 32, 32]} />
    // Robot / machine / android / cyborg
    if (/robot|machine|android|cyborg|mech/.test(object))
      return <boxGeometry args={[1.2, 1.8, 1.0]} />
    // Weapon / sword / blade / gun
    if (/sword|blade|knife|weapon/.test(object))
      return <cylinderGeometry args={[0.08, 0.08, 3.0, 16]} />
    // Fire / flame / explosion
    if (/fire|flame|explosion|lava|magma/.test(object))
      return <coneGeometry args={[0.8, 2.0, 32]} />
    // Lightning / electricity / thunder
    if (/lightning|electric|thunder|bolt|plasma/.test(object))
      return <torusKnotGeometry args={[0.7, 0.15, 200, 8, 5, 2]} />
    // DNA already matched; any molecule / atom / cell
    if (/molecule|atom|cell|electron|proton|nucleus/.test(object))
      return <icosahedronGeometry args={[1.0, 1]} />
    // Clock / time / watch
    if (/clock|time|watch|hourglass/.test(object))
      return <torusGeometry args={[1.0, 0.12, 16, 100]} />
    // Eye / lens / iris
    if (/eye|lens|iris|pupil|retina/.test(object))
      return <sphereGeometry args={[1.0, 64, 64]} />
    // Ring / band / loop
    if (/ring|band|loop|hoop/.test(object))
      return <torusGeometry args={[0.9, 0.3, 32, 100]} />
    // Default: let the LLM color/intent shine through an icosahedron
    return <icosahedronGeometry args={[1.0, 2]} />
  }, [object])

  // --- Material based on object semantics ---
  const matProps = useMemo(() => {
    if (/crystal|gem|diamond|glass|lens|prism/.test(object))
      return { roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.7, envMapIntensity: 2 }
    if (/metal|robot|machine|mech|chrome|steel|iron/.test(object))
      return { roughness: 0.1, metalness: 0.95 }
    if (/fire|flame|lava|sun|star|nova/.test(object))
      return { roughness: 0.8, metalness: 0.0, emissiveIntensity: 0.9 }
    if (/space|galaxy|black.?hole|void|dark/.test(object))
      return { roughness: 0.05, metalness: 0.2, emissiveIntensity: 0.5 }
    if (/organic|human|face|skin|body|brain|heart/.test(object))
      return { roughness: 0.7, metalness: 0.0, emissiveIntensity: 0.05 }
    return { roughness: 0.25, metalness: 0.45, emissiveIntensity: 0.18 }
  }, [object])

  // Ocean wave animation
  const geoRef = useRef()
  const isOcean = /ocean|water|wave|sea|lake/.test(object)
  useFrame((state) => {
    if (!isOcean || !geoRef.current) return
    const pos = geoRef.current.attributes.position
    const t = state.clock.elapsedTime
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      pos.setY(i, Math.sin(x * 1.5 + t) * 0.3 + Math.cos(z * 1.2 + t * 0.8) * 0.2)
    }
    pos.needsUpdate = true
    geoRef.current.computeVertexNormals()
  })

  const isFire = /fire|flame|lava/.test(object)
  const isGalaxy = /galaxy|nebula|universe|cosmos/.test(object)

  return (
    <group ref={grpRef} rotation={isOcean ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <mesh>
        {isOcean
          ? <planeGeometry ref={geoRef} args={[5, 5, 32, 32]} />
          : React.cloneElement(geo)
        }
        <meshStandardMaterial
          color={color}
          emissive={color}
          transparent
          opacity={1}
          {...matProps}
        />
      </mesh>

      {/* Fire particles */}
      {isFire && <Sparkles count={60} size={3} speed={1.5} color={color} scale={2.5} />}
      {/* Galaxy particle cloud */}
      {isGalaxy && <Sparkles count={200} size={1.5} speed={0.3} color={color} scale={5} />}
    </group>
  )
}

// ── Environment backgrounds ──────────────────────────────────────────────────
function SceneBackground({ descriptor }) {
  const object = (descriptor?.object || '').toLowerCase()
  const color = descriptor?.color || '#6ea8ff'
  const isSpace = /space|galaxy|black.?hole|nebula|universe|cosmos|star/.test(object)
  const isOcean = /ocean|water|wave|sea/.test(object)

  return (
    <>
      {isSpace && <Stars radius={100} depth={60} count={4000} factor={5} fade speed={0.8} />}
      {isOcean && <fog attach="fog" args={['#1a4a6b', 8, 30]} />}
    </>
  )
}

// ── Main Scene ───────────────────────────────────────────────────────────────
export default function Scene({ descriptor }) {
  const r = descriptor?.renderer || null
  const color = descriptor?.color || '#ffffff'
  const object = (descriptor?.object || '').toLowerCase()

  // Camera position logic
  const camAction = descriptor?.camera_action || 'auto'
  const camPos = useMemo(() => {
    if (camAction === 'zoom_in')  return [0, 0.5, 3.5]
    if (camAction === 'zoom_out') return [0, 1.5, 10]
    if (camAction === 'top_down') return [0, 7, 0.1]
    if (camAction === 'front')    return [0, 0, 5.5]
    if (camAction === 'side')     return [5, 0, 0]
    if (/ocean|water|wave/.test(object)) return [0, 4, 6]
    return [0, 0.8, 5.5]
  }, [camAction, object])

  const camLook = useMemo(() => {
    if (camAction === 'top_down') return [0, 0, 0]
    return [0, 0, 0]
  }, [camAction])

  return (
    <Canvas camera={{ position: [0, 0.8, 7.5], fov: 52 }} dpr={[1, 2]}>
      <Rig targetPos={r ? camPos : [0, 0.8, 7.5]} targetLook={camLook} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.7} color="#5580ff" />
      <pointLight position={[0, -3, 2]} intensity={0.4} color={color} />

      <SceneBackground descriptor={descriptor} />

      {r && (
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5} floatingRange={[-0.12, 0.12]}>
          <UniversalMesh descriptor={descriptor} />
        </Float>
      )}

      <ContactShadows opacity={0.25} scale={14} blur={3} far={8} position={[0, -2, 0]} />
      <Environment preset="city" />
    </Canvas>
  )
}
