import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/runic.frag'

// Elder Futhark runes ordered by ink density (lightest → heaviest)
const RUNE_CHARS = ['ᛁ', 'ᛚ', 'ᚲ', 'ᚱ', 'ᚦ', 'ᛟ', 'ᛒ', 'ᛞ']

// Senior-engineer wisdom fragments — short ASCII tokens that live in the same
// 8-cell strip layout. Hovered cells "translate" runes into these.
const WISDOM_TOKENS = ['TODO', 'FIXME', 'WTF', 'OLD', 'WIP', 'ASK BOB', 'RTFM', 'RIP']

const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * RUNE_CHARS.length
const FONT_STACK = 'Menlo, Monaco, "Courier New", monospace'

function createRuneAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)

  ctx.fillStyle = 'white'
  ctx.font = `${CHAR_SIZE * 0.8}px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < RUNE_CHARS.length; i++) {
    ctx.fillText(RUNE_CHARS[i], i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

function createWisdomAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Per-token: shrink font until the longest fits within ~92% of its cell.
  for (let i = 0; i < WISDOM_TOKENS.length; i++) {
    const token = WISDOM_TOKENS[i]
    const maxWidth = CHAR_SIZE * 0.92
    let fontSize = CHAR_SIZE * 0.55
    ctx.font = `bold ${fontSize}px ${FONT_STACK}`
    while (ctx.measureText(token).width > maxWidth && fontSize > 6) {
      fontSize -= 1
      ctx.font = `bold ${fontSize}px ${FONT_STACK}`
    }
    ctx.fillText(token, i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

function RunicQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  const runeAtlas = useMemo(() => createRuneAtlas(), [])
  const wisdomAtlas = useMemo(() => createWisdomAtlas(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlas: { value: runeAtlas },
      uAtlasWisdom: { value: wisdomAtlas },
      uAtlasReady: { value: 1.0 },
    }),
    [runeAtlas, wisdomAtlas],
  )

  useFrame(({ clock, pointer }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)

    // Convert pointer (-1..1) to UV (0..1)
    const targetX = (pointer.x + 1) * 0.5
    const targetY = (pointer.y + 1) * 0.5
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08
    u.uMouse.value.copy(mouseRef.current)
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
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <RunicQuad />
      </Canvas>

      {/* DOM hero overlay */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-mono text-5xl font-bold text-text-primary leading-tight tracking-tight">
            // Lore that survives the resignation
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            Knowledge graphs from your codebase, not your wiki.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
            />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Inherit the wisdom
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
