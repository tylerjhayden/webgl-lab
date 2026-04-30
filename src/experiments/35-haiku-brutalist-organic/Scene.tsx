import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length
const LIFE_WIDTH = 120
const LIFE_HEIGHT = 50

function createFontAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)

  ctx.fillStyle = 'white'
  ctx.font = `${CHAR_SIZE * 0.8}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    ctx.fillText(ATLAS_CHARS[i], i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

function conwayStep(grid: Uint8Array): Uint8Array<ArrayBuffer> {
  const newGrid = new Uint8Array(grid.length) as Uint8Array<ArrayBuffer>

  for (let y = 0; y < LIFE_HEIGHT; y++) {
    for (let x = 0; x < LIFE_WIDTH; x++) {
      const idx = y * LIFE_WIDTH + x
      let neighbors = 0

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = (x + dx + LIFE_WIDTH) % LIFE_WIDTH
          const ny = (y + dy + LIFE_HEIGHT) % LIFE_HEIGHT
          const nidx = ny * LIFE_WIDTH + nx
          neighbors += grid[nidx]
        }
      }

      const alive = grid[idx]
      // B3/S23: born on 3, survives on 2-3
      if (alive) {
        newGrid[idx] = neighbors === 2 || neighbors === 3 ? 1 : 0
      } else {
        newGrid[idx] = neighbors === 3 ? 1 : 0
      }
    }
  }

  return newGrid as Uint8Array<ArrayBuffer>
}

function TopologyQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  const atlas = useMemo(() => createFontAtlas(), [])

  const lifeGridRef = useRef<Uint8Array<ArrayBuffer>>(null!)
  if (lifeGridRef.current === null) {
    const grid = new Uint8Array(LIFE_WIDTH * LIFE_HEIGHT) as Uint8Array<ArrayBuffer>
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() > 0.75 ? 1 : 0
    }
    lifeGridRef.current = grid
  }

  const lifeTexture = useMemo(() => {
    return new THREE.DataTexture(
      lifeGridRef.current,
      LIFE_WIDTH,
      LIFE_HEIGHT,
      THREE.RedFormat,
      THREE.UnsignedByteType,
    )
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlas: { value: atlas },
      uAtlasReady: { value: 1.0 },
      uLifeState: { value: lifeTexture },
    }),
    [atlas, lifeTexture],
  )

  useEffect(() => {
    return () => {
      atlas.dispose()
      lifeTexture.dispose()
    }
  }, [atlas, lifeTexture])

  const frameCountRef = useRef(0)

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)

    frameCountRef.current++
    if (frameCountRef.current % 8 === 0) {
      const next = conwayStep(lifeGridRef.current)
      lifeGridRef.current = next
      lifeTexture.image.data.set(next)
      lifeTexture.needsUpdate = true
    }
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </ScreenQuad>
  )
}

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')

  return (
    <div ref={containerRef} className="relative w-full h-full bg-surface">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <TopologyQuad />
      </Canvas>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-mono text-5xl font-bold text-text-primary leading-tight tracking-tight">
            Decisions
            <br />
            that compound.
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            A living protocol for engineering teams.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
            />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Get early access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
