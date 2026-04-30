import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/memdump.frag'

const ATLAS_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length

function createFontAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)

  ctx.fillStyle = 'white'
  ctx.font = `${CHAR_SIZE * 0.78}px monospace`
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

function MemDumpQuad() {
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

const GUTTER_ADDRESSES = [
  '0x00',
  '0x10',
  '0x20',
  '0x30',
  '0x40',
  '0x50',
  '0x60',
  '0x70',
]

export default function Scene() {
  const [email, setEmail] = useState('')

  return (
    <div className="relative w-full h-full bg-surface">
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
      >
        <MemDumpQuad />
      </Canvas>

      {/* DOM hero overlay */}
      <div className="relative z-[5] flex items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="flex items-start gap-6">
          {/* Line-numbered gutter */}
          <div className="font-mono text-xs text-text-muted/40 flex flex-col gap-1 pr-4 pt-2 border-r border-border-subtle/30">
            {GUTTER_ADDRESSES.map((addr) => (
              <span key={addr}>{addr}</span>
            ))}
          </div>

          {/* Headline + subtitle */}
          <div className="max-w-xl space-y-5">
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-text-primary leading-tight tracking-tight">
              0x7F4A2B0::knowledge
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Address the unwritten rules in your codebase.
            </p>
            <div className="flex items-center gap-3 pointer-events-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="0x..@email.com"
                className="font-mono bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
              />
              <button className="font-mono bg-surface-raised/60 backdrop-blur-sm border border-border-subtle text-text-primary hover:border-accent hover:text-accent px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
                Read the address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
