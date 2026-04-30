import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '+', '-', '~', '!', '@', '^', '█']

const THEME = {
  '--color-surface': '#EFE7D2',
  '--color-surface-raised': 'rgba(255, 252, 238, 0.55)',
  '--color-surface-overlay': 'rgba(255, 252, 238, 0.75)',
  '--color-border-subtle': 'rgba(26, 31, 24, 0.22)',
  '--color-accent': '#3D4A33',
  '--color-accent-hover': '#2A3525',
  '--color-text-primary': '#1A1F18',
  '--color-text-secondary': '#5A5847',
  '--color-text-muted': '#9A9580',
} as React.CSSProperties

const RULED_LINES =
  'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(61, 74, 51, 0.10) 31px, rgba(61, 74, 51, 0.10) 32px)'

const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10  0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>\")"

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
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: RULED_LINES }} />
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: '240px 240px' }} />

      {/* corner punch holes */}
      <div className="absolute top-6 left-6 flex gap-1.5 pointer-events-none">
        <span className="block w-1.5 h-1.5 rounded-full bg-[#1A1F18]/30" />
        <span className="block w-1.5 h-1.5 rounded-full bg-[#1A1F18]/30" />
      </div>

      {/* folio stamp */}
      <div className="absolute top-5 right-6 pointer-events-none font-mono text-[10px] tracking-[0.32em] text-text-muted uppercase">
        Fig. 32 · Ledger
      </div>

      {/* footer rule + caption */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-5 pointer-events-none">
        <div className="h-px bg-[#1A1F18]/20 mb-2" />
        <div className="flex justify-between font-mono text-[10px] tracking-[0.28em] uppercase text-text-muted">
          <span>Iron-gall · Ruled 32px</span>
          <span>§ 32</span>
        </div>
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl font-medium text-text-primary leading-[1.08] tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
            Every diff has a reason.<br />Most teams lose it.
          </h1>
          <p className="text-text-secondary text-base leading-relaxed font-light"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Capture the <em className="not-italic underline decoration-1 underline-offset-4 decoration-[#3D4A33]/60">why</em> behind merged code, so future engineers don't have to reverse-engineer the past.
          </p>
          <div className="flex items-center justify-center gap-0 pointer-events-auto pt-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised backdrop-blur-[1px] border border-border-subtle border-r-0 px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:bg-[rgba(255,252,238,0.85)] transition-colors"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }} />
            <button className="bg-accent hover:bg-accent-hover text-[#EFE7D2] font-medium px-5 py-2.5 border border-accent text-sm transition-colors whitespace-nowrap tracking-wide"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
              See how it works
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
