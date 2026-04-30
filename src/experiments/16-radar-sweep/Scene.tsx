import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/radar.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      className="relative w-full h-full bg-[#f4f1e8] overflow-hidden"
    >
      {/* Paper-grain overlay */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Anchor mark — compass cardinal */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
        <span
          className="font-semibold text-[#2a2620]/[0.06] text-[18rem] leading-none select-none"
          style={{
            fontFamily: '"Fraunces", serif',
            fontVariationSettings: '"opsz" 144, "SOFT" 0',
          }}
        >
          N
        </span>
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-6xl font-semibold text-[#2a2620] leading-[1.05] tracking-tight"
            style={{
              fontFamily: '"Fraunces", serif',
              fontVariationSettings: '"opsz" 144, "SOFT" 0',
            }}
          >
            what the dial keeps surfacing.
          </h1>

          <p className="font-sans text-[#5e574d] text-lg leading-relaxed">
            A slow rotation across the tacit knowledge your org keeps forgetting.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/60 backdrop-blur-sm border border-[#d4cdbe] rounded-lg px-4 py-2.5 text-[#2a2620] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#a85b3c] transition-colors"
            />
            <button className="bg-[#a85b3c] hover:bg-[#bf6c4a] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Watch the dial
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
