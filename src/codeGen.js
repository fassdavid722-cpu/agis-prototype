// codeGen.js — generates readable Three.js code string for each renderer
// This is what gets shown in the CODE panel alongside the live scene

const TEMPLATES = {
  cube: (color) => `import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 100)
camera.position.set(0, 0, 4)

const geo = new THREE.BoxGeometry(2, 2, 2)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.3,
  metalness: 0.4,
})
const cube = new THREE.Mesh(geo, mat)
scene.add(cube)

// Point lights for depth
scene.add(new THREE.PointLight('#ffffff', 1.5, 20).set(3, 3, 3))
scene.add(new THREE.AmbientLight('#ffffff', 0.4))

// Animate
function tick() {
  cube.rotation.x += 0.005
  cube.rotation.y += 0.008
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()`,

  sphere: (color) => `import * as THREE from 'three'

const geo = new THREE.SphereGeometry(1.6, 64, 64)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.1,
  metalness: 0.8,
  emissive: '${color}',
  emissiveIntensity: 0.15,
})
const sphere = new THREE.Mesh(geo, mat)
scene.add(sphere)

// Glow effect via bloom post-processing
// EffectComposer > UnrealBloomPass({ threshold: 0.2, strength: 0.8 })

function tick() {
  sphere.rotation.y += 0.006
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()`,

  torus: (color) => `import * as THREE from 'three'

// TorusGeometry(radius, tube, radialSeg, tubularSeg)
const geo = new THREE.TorusGeometry(1.4, 0.45, 32, 120)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.2,
  metalness: 0.6,
})
const torus = new THREE.Mesh(geo, mat)
scene.add(torus)

function tick(t) {
  torus.rotation.x = t * 0.0004
  torus.rotation.y = t * 0.0006
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)`,

  cone: (color) => `import * as THREE from 'three'

// ConeGeometry(radius, height, radialSegments)
const geo = new THREE.ConeGeometry(1.2, 2.5, 6)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.35,
  metalness: 0.5,
  flatShading: true,  // low-poly look
})
const cone = new THREE.Mesh(geo, mat)
scene.add(cone)

function tick() {
  cone.rotation.y += 0.007
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()`,

  cylinder: (color) => `import * as THREE from 'three'

// CylinderGeometry(topR, bottomR, height, radialSeg)
const geo = new THREE.CylinderGeometry(0.9, 0.9, 2.8, 40)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.2,
  metalness: 0.7,
})
const cyl = new THREE.Mesh(geo, mat)
scene.add(cyl)

function tick() {
  cyl.rotation.y += 0.006
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()`,

  octahedron: (color) => `import * as THREE from 'three'

// OctahedronGeometry — diamond shape
const geo = new THREE.OctahedronGeometry(1.6, 0)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.05,
  metalness: 0.9,
  wireframe: false,
})
const gem = new THREE.Mesh(geo, mat)
scene.add(gem)

function tick(t) {
  gem.rotation.y = t * 0.0005
  gem.rotation.z = Math.sin(t * 0.0003) * 0.3
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)`,

  star: (color) => `import * as THREE from 'three'

// Star shape via custom ShapeGeometry
const shape = new THREE.Shape()
const pts = 5, outer = 1.5, inner = 0.6
for (let i = 0; i < pts * 2; i++) {
  const r = i % 2 === 0 ? outer : inner
  const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2
  i === 0 ? shape.moveTo(Math.cos(a)*r, Math.sin(a)*r)
           : shape.lineTo(Math.cos(a)*r, Math.sin(a)*r)
}
shape.closePath()

const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelSize: 0.05 })
const mat = new THREE.MeshStandardMaterial({ color: '${color}', metalness: 0.8 })
const star = new THREE.Mesh(geo, mat)
scene.add(star)

function tick() {
  star.rotation.z += 0.006
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()`,

  plane: (color) => `import * as THREE from 'three'

// PlaneGeometry with grid helper
const geo = new THREE.PlaneGeometry(6, 6, 20, 20)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}',
  roughness: 0.8,
  side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(geo, mat)
plane.rotation.x = -Math.PI / 2
scene.add(plane)

// Grid overlay
const grid = new THREE.GridHelper(6, 20, '#333', '#222')
scene.add(grid)

renderer.render(scene, camera)`,

  environment: (object, color) => `import * as THREE from 'three'

// Environment: ${object}
// Uses instanced meshes + particle systems for performance

const count = ${object === 'space' ? 3000 : object === 'ocean' ? 1 : 80}

${object === 'space' ? `// Starfield
const geo = new THREE.BufferGeometry()
const pos = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 40
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
const stars = new THREE.Points(geo,
  new THREE.PointsMaterial({ color: '#ffffff', size: 0.08 }))
scene.add(stars)

function tick() {
  stars.rotation.y += 0.0002
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()` : object === 'ocean' ? `// Ocean plane with animated shader
const geo = new THREE.PlaneGeometry(20, 20, 80, 80)
const mat = new THREE.MeshStandardMaterial({
  color: '${color}', roughness: 0.1, metalness: 0.4
})
const ocean = new THREE.Mesh(geo, mat)
ocean.rotation.x = -Math.PI / 2
scene.add(ocean)

function tick(t) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    pos.setY(i, Math.sin(x * 1.5 + t * 0.001) * 0.3
             + Math.cos(z * 1.2 + t * 0.0008) * 0.2)
  }
  pos.needsUpdate = true
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)` : `// ${object} environment — instanced geometry
const geo = new THREE.CylinderGeometry(0.1, 0.3, 1 + Math.random(), 5)
const mat = new THREE.MeshStandardMaterial({ color: '${color}' })
for (let i = 0; i < ${object === 'city' ? 40 : 30}; i++) {
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set((Math.random()-0.5)*10, 0, (Math.random()-0.5)*10)
  mesh.scale.y = 0.5 + Math.random() * 3
  scene.add(mesh)
}
renderer.render(scene, camera)`}`,
}

export function getCode(descriptor) {
  if (!descriptor || descriptor.error) return null
  const { renderer, object, color } = descriptor
  const fn = TEMPLATES[renderer === 'environment' ? 'environment' : renderer]
  if (!fn) return `// No code template for renderer: ${renderer}`
  if (renderer === 'environment') return fn(object, color)
  return fn(color)
}
