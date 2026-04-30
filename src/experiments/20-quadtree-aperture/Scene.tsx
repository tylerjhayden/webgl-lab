import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/quadtree.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      className="relative w-full h-full bg-[#ebe6dc]"
    >
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl pointer-events-none">
          <div className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-3xl px-12 py-10 text-center space-y-6 shadow-[0_8px_32px_rgba(180,170,200,0.15)]">
            <h1 className="font-sans font-extralight uppercase tracking-[0.18em] text-5xl text-[#1f1d1a] leading-tight">
              // Zoom into what matters.
            </h1>

            <p className="text-[#5a554d] text-lg leading-relaxed">
              Detail on demand. Context always.
            </p>

            <div className="flex items-center justify-center gap-3 pointer-events-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/30 backdrop-blur-md border border-white/40 rounded-lg px-4 py-2.5 text-[#1f1d1a] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-white/80 transition-colors"
              />
              <button className="bg-white/30 backdrop-blur-md border border-white/50 text-[#1f1d1a] hover:bg-white/50 rounded-full px-5 py-2.5 text-xs font-light tracking-wider uppercase transition-colors whitespace-nowrap">
                Focus the lens
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
