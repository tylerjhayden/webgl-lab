import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '{', '}', ';', '/', '*', '=', '#']

const THEME = {
  '--color-surface': '#EFE9DD',
  '--color-surface-raised': 'rgba(255, 255, 255, 0.5)',
  '--color-surface-overlay': 'rgba(255, 255, 255, 0.7)',
  '--color-border-subtle': 'rgba(20, 20, 20, 0.08)',
  '--color-accent': '#1A1A1A',
  '--color-accent-hover': '#000000',
  '--color-text-primary': '#1A1A1A',
  '--color-text-secondary': '#5A554B',
  '--color-text-muted': '#8a8478',
} as React.CSSProperties

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      theme={THEME}
    >
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-7">
          <h1 className="text-6xl font-light text-text-primary leading-[1.05] tracking-[0.04em]">
            Soft edges.<br />Sharp guarantees.
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed font-light tracking-wide">
            The developer platform that scales with your ambitions.
          </p>
          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised backdrop-blur-xl border border-border-subtle rounded-full px-5 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:bg-white/70 transition-all" />
            <div className="rounded-full p-[1.5px] bg-[conic-gradient(from_180deg,#fcd6e7,#cce8ff,#e2d6fc,#fdf0c6,#fcd6e7)]">
              <button className="bg-accent hover:bg-accent-hover text-[#EFE9DD] font-medium px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap block">
                Get early access
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
