import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/constellation.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length

const AUTHORS = ['@minerva', '@cortana', '@noble-six', '@chief', '@arbiter', '@johnson', '@keyes']
const AGES = [
  '2 days ago',
  '4 days ago',
  '6 days ago',
  'last week',
  '3 commits ago',
  '12 commits ago',
  'yesterday',
  'an hour ago',
]
const HASH_ALPHABET = '0123456789abcdef'
const ROTATE_INTERVAL_MS = 5000

function randomHash(): string {
  let s = ''
  for (let i = 0; i < 7; i++) {
    s += HASH_ALPHABET[Math.floor(Math.random() * HASH_ALPHABET.length)]
  }
  return s
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildSubtitle(): string {
  return `${randomHash()} · ${pick(AUTHORS)} · ${pick(AGES)}`
}

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

function ConstellationQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  const atlas = useMemo(() => createFontAtlas(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlas: { value: atlas },
      uAtlasReady: { value: 1.0 },
    }),
    [atlas],
  )

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
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
  const [subtitle, setSubtitle] = useState('f3a2b91 · @minerva · 2 days ago')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setSubtitle(buildSubtitle())
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full h-full bg-[#0d0816]">
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
      >
        <ConstellationQuad />
      </Canvas>

      {/* Ambient warm-glow halo behind the hero */}
      <div
        aria-hidden
        className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(242,114,136,0.08)_0%,transparent_60%)]"
      />

      {/* DOM hero overlay */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-6xl font-light text-text-primary leading-tight tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            // What got us here.
          </h1>

          <p className="font-mono text-base tracking-tight tabular-nums text-[#ffc78c]/70">
            {subtitle}
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-[#3d2840] rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#f27288] transition-colors"
            />
            <button
              className="bg-[#f27288] hover:bg-[#ff8aa0] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap shadow-[0_0_20px_rgba(242,114,136,0.4)]"
            >
              Trace the lineage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
