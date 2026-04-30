import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/redacted.frag'

// 16 fabricated dev-folklore tokens (≤ 8 chars each), plus the solid block
// occupying the last cell. Atlas is a horizontal strip of 17 cells.
const REVEAL_TOKENS = [
  'BOB KNEW',
  'RIP 2019',
  "DON'T",
  'HACK',
  '???',
  '[FIXED]',
  'NO DOC',
  'WONTFIX',
  'TODO',
  'CURSED',
  'LEGACY',
  'SEE JIRA',
  'ASK SAM',
  'PRE-Q3',
  'YOLO',
  'HERE BE',
]
const BLOCK_CHAR = '█' // █
const ATLAS_CHARS = [...REVEAL_TOKENS, BLOCK_CHAR]
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
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Pick a font size per cell that fits the longest token within 64px
  // with a little padding. Multi-char tokens shrink, the solid block stays large.
  const PAD = 6
  const MAX_W = CHAR_SIZE - PAD * 2

  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    const ch = ATLAS_CHARS[i]
    let size = ch === BLOCK_CHAR ? CHAR_SIZE * 0.95 : CHAR_SIZE * 0.5
    ctx.font = `bold ${size}px monospace`

    if (ch !== BLOCK_CHAR) {
      // Shrink until it fits horizontally
      while (ctx.measureText(ch).width > MAX_W && size > 8) {
        size -= 1
        ctx.font = `bold ${size}px monospace`
      }
    }

    ctx.fillText(ch, i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

function RedactedQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  const atlas = useMemo(() => createFontAtlas(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlas: { value: atlas },
      uAtlasReady: { value: 1.0 },
    }),
    [atlas],
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

  const terminalFont = '"JetBrains Mono", monospace'

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#050805]"
      style={{ fontFamily: terminalFont }}
    >
      {/* Caret blink keyframes — scoped, ~1Hz */}
      <style>{`@keyframes redacted-blink { 50% { opacity: 0; } }`}</style>

      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <RedactedQuad />
      </Canvas>

      {/* CRT scanline overlay — sits above the canvas, below the hero */}
      <div
        aria-hidden
        className="absolute inset-0 z-[4] pointer-events-none bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,0.25)_3px)]"
      />

      {/* DOM hero overlay */}
      <div
        className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none"
        style={{ fontFamily: terminalFont }}
      >
        <div className="max-w-3xl text-center space-y-6">
          <h1
            className="text-5xl font-black uppercase text-text-primary leading-tight tracking-tight whitespace-nowrap"
            style={{ textShadow: '0 0 12px #a6ff1a' }}
          >
            <span className="text-text-secondary">~/codebase </span>
            <span className="text-text-secondary">$ </span>
            git blame --tribal
            <span
              className="inline-block ml-1"
              style={{ animation: 'redacted-blink 1s step-end infinite', color: '#a6ff1a' }}
            >
              ▌
            </span>
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            What the senior engineer would have told you.
          </p>

          <div className="flex items-center justify-center gap-2 pointer-events-auto pt-2">
            <span className="text-[#a6ff1a] text-sm">$</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter@email.com"
              className="bg-transparent border-b-2 border-[#a6ff1a] px-2 py-1.5 text-[#a6ff1a] placeholder:text-[#a6ff1a]/40 text-sm w-64 focus:outline-none caret-[#a6ff1a]"
              style={{ fontFamily: terminalFont }}
            />
            <button
              className="border-2 border-[#a6ff1a] bg-transparent text-[#a6ff1a] font-black uppercase rounded-none px-4 py-1.5 text-sm transition-colors whitespace-nowrap hover:bg-[#a6ff1a] hover:text-black"
              style={{ fontFamily: terminalFont }}
            >
              ./request_access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
