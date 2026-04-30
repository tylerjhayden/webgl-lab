import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/main.vert'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']
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
  ctx.font = `${CHAR_SIZE * 0.8}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    ctx.fillText(ATLAS_CHARS[i], i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

function ShaderQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  const atlas = useMemo(() => createFontAtlas(), [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uAtlas: { value: atlas },
    uAtlasReady: { value: 1.0 },
  }), [atlas])

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
  })

  return (
    <ScreenQuad>
      <shaderMaterial ref={materialRef} vertexShader={vertexShader}
        fragmentShader={fragmentShader} uniforms={uniforms}
        transparent depthWrite={false} />
    </ScreenQuad>
  )
}

const THEME = {
  '--color-surface': '#D6C29F',
  '--color-surface-raised': 'rgba(232, 218, 188, 0.65)',
  '--color-surface-overlay': 'rgba(232, 218, 188, 0.85)',
  '--color-border-subtle': 'rgba(38, 32, 14, 0.25)',
  '--color-accent': '#7A371D',
  '--color-accent-hover': '#5C2916',
  '--color-text-primary': '#26200E',
  '--color-text-secondary': '#5E4F33',
  '--color-text-muted': '#9A8762',
} as React.CSSProperties

const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0 0.05  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>\")"

// torn kraft strip — kraft-colored block with displacement-noisy right edge,
// positioned to bleed slightly into the canvas-right half
const TORN_STRIP =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 800' preserveAspectRatio='none'><filter id='t' x='-20%25' y='-2%25' width='140%25' height='104%25'><feTurbulence type='fractalNoise' baseFrequency='0.04 0.55' numOctaves='2' seed='4'/><feDisplacementMap in='SourceGraphic' scale='16'/></filter><rect x='-60' y='0' width='90' height='800' fill='%23D6C29F' filter='url(%23t)'/></svg>\")"

// thin shadow that traces the tear edge (slightly darker rust)
const TORN_SHADOW =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 800' preserveAspectRatio='none'><filter id='ts'><feTurbulence type='fractalNoise' baseFrequency='0.04 0.55' numOctaves='2' seed='4'/><feDisplacementMap in='SourceGraphic' scale='16'/></filter><rect x='28' y='0' width='2' height='800' fill='%23553015' filter='url(%23ts)'/></svg>\")"

export default function Scene() {
  const [email, setEmail] = useState('')
  return (
    <div className="relative w-full h-full bg-surface overflow-hidden" style={THEME}>
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full" />
        <div className="relative w-1/2 h-full">
          <Canvas className="!absolute inset-0"
            gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
            dpr={[1, 1]}>
            <ShaderQuad />
          </Canvas>
        </div>
      </div>

      {/* paper grain — applied to whole surface */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-55"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: '220px 220px' }} />

      {/* torn kraft strip bleeds into canvas at the 50% boundary */}
      <div className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: 'calc(50% - 4px)',
          width: '36px',
          backgroundImage: TORN_STRIP,
          backgroundSize: '36px 100%',
          backgroundRepeat: 'no-repeat',
        }} />
      <div className="absolute top-0 bottom-0 pointer-events-none opacity-55"
        style={{
          left: 'calc(50% - 4px)',
          width: '36px',
          backgroundImage: TORN_SHADOW,
          backgroundSize: '36px 100%',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
        }} />

      {/* top-left: rubber-stamped folio */}
      <div className="absolute top-7 left-8 pointer-events-none">
        <div className="-rotate-[3deg] inline-flex items-center gap-2.5 border-[1.5px] border-accent/55 px-3 py-1"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
          <span className="text-[10px] uppercase tracking-[0.32em] text-accent/80">Nº 39</span>
          <span className="block w-px h-3 bg-accent/40" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-accent/80">Foundry</span>
        </div>
      </div>

      {/* top-right: edition mark */}
      <div className="absolute top-9 right-9 pointer-events-none text-right text-text-muted"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
        <div className="text-[10px] uppercase tracking-[0.30em]">Field manual</div>
        <div className="text-[10px] uppercase tracking-[0.30em] mt-0.5">Series MMXXVI</div>
      </div>

      {/* bottom rule + caption */}
      <div className="absolute bottom-0 left-0 right-0 px-9 pb-5 pointer-events-none">
        <div className="h-px bg-text-primary/15 mb-2" />
        <div className="flex justify-between text-text-muted"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
          <span className="text-[10px] uppercase tracking-[0.30em]">Iron-oxide on kraft</span>
          <span className="text-[10px] uppercase tracking-[0.30em]">Pressed · 39 / 100</span>
        </div>
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-text-primary leading-[1.05] tracking-tight"
            style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)', fontWeight: 500 }}>
            Stop losing the <em className="italic font-light text-accent">why</em>.
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed font-light"
            style={{ fontFamily: "'Spectral', Georgia, serif" }}>
            Every trade-off, every rejected alternative, every architectural call — in one workspace your team and your agents can both read.
          </p>
          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised backdrop-blur-[1px] border border-border-subtle rounded-sm px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }} />
            <button className="bg-accent hover:bg-accent-hover text-[#E8DABC] font-medium px-5 py-2.5 rounded-sm text-sm transition-colors whitespace-nowrap shadow-[0_2px_0_rgba(38,32,14,0.25)] tracking-wide uppercase"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
              Capture a decision
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
