import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '✦', '◌', '◍', '✺', '❋', '✸', '●']

const THEME = {
  '--color-surface': '#E6D9BC',
  '--color-surface-raised': 'rgba(248, 240, 220, 0.55)',
  '--color-surface-overlay': 'rgba(248, 240, 220, 0.78)',
  '--color-border-subtle': 'rgba(61, 32, 15, 0.28)',
  '--color-accent': '#A2562B',
  '--color-accent-hover': '#7C3F1E',
  '--color-text-primary': '#3D200F',
  '--color-text-secondary': '#7A4F2F',
  '--color-text-muted': '#A88B68',
} as React.CSSProperties

const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 260'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.36  0 0 0 0 0.18  0 0 0 0 0.05  0 0 0 0.20 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>\")"

const VIGNETTE =
  'radial-gradient(ellipse at center, transparent 45%, rgba(120, 70, 30, 0.18) 100%)'

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      theme={THEME}
      className="relative w-full h-full bg-surface overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-55"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: '260px 260px' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: VIGNETTE }} />

      {/* folio mark top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-3 text-text-muted"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        <span className="block w-12 h-px bg-current opacity-50" />
        <span className="text-sm italic tracking-[0.18em]">·  I  ·</span>
        <span className="block w-12 h-px bg-current opacity-50" />
      </div>

      {/* corner folio number */}
      <div className="absolute bottom-6 right-7 pointer-events-none italic text-text-muted"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px' }}>
        — xxxv —
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-14 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-7">
          {/* fleuron */}
          <div className="text-text-secondary text-2xl leading-none opacity-70 select-none"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>❦</div>

          <h1 className="text-text-primary leading-[1.0] tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem, 6.5vw, 5.5rem)', fontWeight: 300, fontStyle: 'italic' }}>
            Memory has weight.<br />We help your code carry it.
          </h1>

          <p className="text-text-secondary text-lg leading-[1.65] font-light max-w-xl mx-auto"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            <span className="float-left text-5xl leading-[0.85] mr-2 mt-1 text-accent font-medium"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>K</span>
            eep ADRs anchored to the systems they describe — not buried in a folder no one opens.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised backdrop-blur-[1px] border border-border-subtle rounded-full px-5 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors italic"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }} />
            <button className="bg-accent hover:bg-accent-hover text-[#F4E9CC] font-medium px-6 py-2.5 rounded-full text-sm transition-all whitespace-nowrap shadow-[0_2px_0_rgba(61,32,15,0.25)]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Try the workspace
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
