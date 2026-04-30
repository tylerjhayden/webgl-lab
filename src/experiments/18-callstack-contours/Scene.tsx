import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/contours.frag'

// Box-drawing glyphs read as topographic isolines — light → heavy
const ATLAS_CHARS = ['─', '━', '═', '║', '╬', '╣', '╩', '╦']

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS, { fontScale: 0.85 })
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      className="relative w-full h-full bg-[#f4f1e8] overflow-hidden"
    >
      {/* Paper-grain overlay — subtle SVG turbulence multiplied into the page */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Giant frame-depth anchor numeral — sits behind the headline */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
        <span className="font-mono font-bold text-[#2a2620]/[0.06] text-[18rem] leading-none tracking-tighter select-none">
          0x7F
        </span>
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-6xl font-bold text-[#2a2620] leading-[1.05] tracking-tight"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            frame #14: lost context
          </h1>

          <p className="font-sans text-[#5e574d] text-lg leading-relaxed">
            Trace decisions back to the engineer who made them.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/60 backdrop-blur-sm border border-[#d4cdbe] rounded-lg px-4 py-2.5 text-[#2a2620] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#738c61] transition-colors"
            />
            <button className="bg-[#738c61] hover:bg-[#849c72] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Recover the frame
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
