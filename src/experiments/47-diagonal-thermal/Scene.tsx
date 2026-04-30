import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

const THEME = {
  '--color-surface': '#E2D5BE',
  '--color-surface-raised': 'rgba(248, 240, 224, 0.55)',
  '--color-surface-overlay': 'rgba(248, 240, 224, 0.78)',
  '--color-border-subtle': 'rgba(47, 37, 32, 0.20)',
  '--color-accent': '#B5523A',
  '--color-accent-hover': '#8C3D2A',
  '--color-text-primary': '#2F2520',
  '--color-text-secondary': '#6E5A4C',
  '--color-text-muted': '#A8957C',
} as React.CSSProperties

const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>\")"

const SELVEDGE =
  'repeating-linear-gradient(45deg, transparent 0, transparent 5px, rgba(47, 37, 32, 0.10) 5px, rgba(47, 37, 32, 0.10) 6px)'

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
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: '240px 240px' }} />

      {/* selvedge bands top + bottom */}
      <div className="absolute top-0 inset-x-0 h-3 pointer-events-none" style={{ backgroundImage: SELVEDGE }} />
      <div className="absolute bottom-0 inset-x-0 h-3 pointer-events-none" style={{ backgroundImage: SELVEDGE }} />

      {/* wax-seal mark */}
      <div className="absolute top-10 left-10 -rotate-[7deg] pointer-events-none select-none">
        <div className="w-20 h-20 rounded-full border-[1.5px] border-accent/70 flex items-center justify-center text-center"
          style={{ boxShadow: 'inset 0 0 0 4px rgba(181, 82, 58, 0.10)' }}>
          <div className="text-accent/85" style={{ fontFamily: "'Newsreader', serif", lineHeight: 1.05 }}>
            <div className="text-[9px] uppercase tracking-[0.32em]">Sonnet</div>
            <div className="italic text-[14px] -mt-0.5">xxxvii</div>
            <div className="text-[8px] uppercase tracking-[0.24em] mt-0.5">Limewash</div>
          </div>
        </div>
      </div>

      {/* mark on right */}
      <div className="absolute top-12 right-10 pointer-events-none text-right text-text-muted"
        style={{ fontFamily: "'Newsreader', serif" }}>
        <div className="text-[10px] uppercase tracking-[0.32em]">Series · MMXXVI</div>
        <div className="italic text-xs mt-0.5">Hand-fired in clay</div>
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-text-primary leading-[1.05] tracking-tight"
            style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)', fontWeight: 400 }}>
            When the senior engineer leaves,<br />the <em className="italic font-light text-accent">why</em> shouldn't leave with them.
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed font-light"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Decision artifacts that survive turnover, refactors, and the next platform migration.
          </p>
          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised backdrop-blur-[1px] border border-border-subtle rounded-md px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }} />
            <button className="bg-accent hover:bg-accent-hover text-[#F4E9CC] font-medium px-5 py-2.5 rounded-md text-sm transition-colors whitespace-nowrap shadow-[0_2px_0_rgba(47,37,32,0.20)]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Preserve the rationale
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
