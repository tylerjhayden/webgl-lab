import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { ShaderHero } from '../../components/ShaderHero'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length

// Per-cell weight alternation is unique to this scene — useFontAtlas only
// supports a single weight, so the atlas stays inline.
function createAlternatingWeightAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    const weight = i % 2 === 0 ? '100' : '700'
    ctx.font = `${weight} ${CHAR_SIZE * 0.8}px monospace`
    ctx.fillText(ATLAS_CHARS[i], i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

const THEME = {
  '--color-surface': '#100a0c',
  '--color-text-primary': '#f7e6e0',
  '--color-text-secondary': '#c9a89e',
  '--color-text-muted': '#7a5d57',
} as React.CSSProperties

export default function Scene() {
  const atlas = useMemo(() => createAlternatingWeightAtlas(), [])
  useEffect(() => () => atlas.dispose(), [atlas])
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      theme={THEME}
    >
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-6xl text-text-primary leading-[1.05] tracking-tight"
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 300,
              fontStyle: 'italic',
            }}
          >
            Distributed teams.
            <br />
            Shared decisions.
          </h1>

          <p
            className="text-text-secondary text-lg leading-relaxed tracking-wide"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300 }}
          >
            A workspace built for AI-native engineering.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="backdrop-blur-sm rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none transition-colors"
              style={{
                background: 'rgba(28, 16, 18, 0.55)',
                border: '1px solid #3a2421',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            <button
              className="bg-gradient-to-br from-rose-400 to-rose-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap"
              style={{
                boxShadow: '0 0 24px rgba(255, 107, 97, 0.35)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Get early access
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
