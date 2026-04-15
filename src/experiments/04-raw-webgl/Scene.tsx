import { useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import RawCanvasWrapper from '../../components/RawCanvasWrapper'

function createScene(container: HTMLDivElement): () => void {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0a0a0f')

  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(3, 2, 4)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambient)
  const directional = new THREE.DirectionalLight(0xffffff, 1)
  directional.position.set(5, 5, 5)
  scene.add(directional)

  // Torus knot
  const geometry = new THREE.TorusKnotGeometry(1, 0.35, 128, 32)
  const material = new THREE.MeshPhysicalMaterial({
    color: '#6366f1',
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Grid helper
  const grid = new THREE.GridHelper(10, 20, '#1a1a2e', '#1a1a2e')
  grid.position.y = -2
  scene.add(grid)

  // Resize handler
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  window.addEventListener('resize', onResize)

  // Animation loop
  let frameId: number
  const clock = new THREE.Clock()

  const animate = () => {
    frameId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()
    mesh.rotation.x = elapsed * 0.3
    mesh.rotation.y = elapsed * 0.5
    material.color.setHSL((elapsed * 0.05) % 1, 0.7, 0.5)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // Cleanup
  return () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
    controls.dispose()
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    container.removeChild(renderer.domElement)
  }
}

export default function Scene() {
  const setup = useCallback(
    (container: HTMLDivElement) => createScene(container),
    [],
  )
  return <RawCanvasWrapper setup={setup} />
}
