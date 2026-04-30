import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { ShaderHero } from '../../components/ShaderHero'
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
const BLOCK_CHAR = '█'
const ATLAS_CHARS = [...REVEAL_TOKENS, BLOCK_CHAR]
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length

// BLOCK_CHAR oversized + per-token shrink-to-fit don't fit useFontAtlas's
// uniform fontScale model — keep this atlas inline.
function createRedactedAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const PAD = 6
  const MAX_W = CHAR_SIZE - PAD * 2

  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    const ch = ATLAS_CHARS[i]
    let size = ch === BLOCK_CHAR ? CHAR_SIZE * 0.95 : CHAR_SIZE * 0.5
    ctx.font = `bold ${size}px monospace`
    if (ch !== BLOCK_CHAR) {
      while (ctx.measureText(ch).width > MAX_W && size > 8) {
        size -= 1
        ctx.font = `bold ${size}px monospace`
      }
    }
    ctx.fillText(ch, i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

const TERMINAL_FONT = '"JetBrains Mono", monospace'

export default function Scene() {
  const atlas = useMemo(() => createRedactedAtlas(), [])
  useEffect(() => () => atlas.dispose(), [atlas])

  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      interactive
      uniforms={{ uAtlas: { value: atlas } }}
      theme={{ fontFamily: TERMINAL_FONT }}
      className="relative w-full h-full bg-[#050805]"
    >
      {/* Caret blink keyframes — scoped, ~1Hz */}
      <style>{`@keyframes redacted-blink { 50% { opacity: 0; } }`}</style>

      {/* CRT scanline overlay — sits above the canvas, below the hero */}
      <div
        aria-hidden
        className="absolute inset-0 z-[4] pointer-events-none bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,0.25)_3px)]"
      />

      <div
        className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none"
        style={{ fontFamily: TERMINAL_FONT }}
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
              style={{ fontFamily: TERMINAL_FONT }}
            />
            <button
              className="border-2 border-[#a6ff1a] bg-transparent text-[#a6ff1a] font-black uppercase rounded-none px-4 py-1.5 text-sm transition-colors whitespace-nowrap hover:bg-[#a6ff1a] hover:text-black"
              style={{ fontFamily: TERMINAL_FONT }}
            >
              ./request_access
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
