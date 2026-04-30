import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/gravity.frag'

// Atlas index → arrow pointing TOWARD heading. Index derived from
// floor((atan2(dy,dx) + PI) / (2*PI) * 8): 0 ≈ -π → ←, 4 ≈ 0 → →, 6 ≈ +π/2 → ↑.
const ATLAS_CHARS = ['←', '↙', '↓', '↘', '→', '↗', '↑', '↖']

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS, { fontScale: 0.7 })
  const containerRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const [email, setEmail] = useState('')

  // Stable IUniform refs the ResizeObserver mutates; ShaderHero merges them in
  // once and three.js reads .value each frame.
  const headingCenter = useMemo(() => ({ value: new THREE.Vector2(0.5, 0.5) }), [])
  const headingHalfSize = useMemo(() => ({ value: new THREE.Vector2(0.18, 0.06) }), [])

  useEffect(() => {
    const updateBbox = () => {
      const h1 = h1Ref.current
      const container = containerRef.current
      if (!h1 || !container) return
      const rect = h1.getBoundingClientRect()
      const canvasRect = container.getBoundingClientRect()
      if (canvasRect.width === 0 || canvasRect.height === 0) return

      const cx = (rect.left + rect.width / 2 - canvasRect.left) / canvasRect.width
      // Flip Y to UV space (0 bottom, 1 top)
      const cy = 1.0 - (rect.top + rect.height / 2 - canvasRect.top) / canvasRect.height
      const hw = rect.width / 2 / canvasRect.width
      const hh = rect.height / 2 / canvasRect.height

      headingCenter.value.set(cx, cy)
      headingHalfSize.value.set(hw, hh)
    }

    updateBbox()

    const h1 = h1Ref.current
    const container = containerRef.current
    if (!h1 || !container) return

    const observer = new ResizeObserver(updateBbox)
    observer.observe(h1)
    observer.observe(container)
    return () => observer.disconnect()
  }, [headingCenter, headingHalfSize])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#f4f1e8] overflow-hidden">
      <ShaderHero
        fragmentShader={fragmentShader}
        uniforms={{
          uAtlas: { value: atlas },
          uHeadingCenter: headingCenter,
          uHeadingHalfSize: headingHalfSize,
        }}
        className="absolute inset-0"
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

        {/* Anchor mark — typographic pilcrow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
          <span
            className="font-bold text-[#2a2620]/[0.06] text-[18rem] leading-none select-none"
            style={{ fontFamily: '"Lora", serif' }}
          >
            ¶
          </span>
        </div>

        <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
          <div className="max-w-2xl text-center space-y-6">
            <h1
              ref={h1Ref}
              className="text-6xl font-bold text-[#2a2620] leading-[1.05] tracking-tight inline-block"
              style={{ fontFamily: '"Lora", serif' }}
            >
              answers find their gravity.
            </h1>

            <p className="font-sans text-[#5e574d] text-lg leading-relaxed">
              Set a question on the page; the right people drift toward it like iron filings.
            </p>

            <div className="flex items-center justify-center gap-3 pointer-events-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/60 backdrop-blur-sm border border-[#d4cdbe] rounded-lg px-4 py-2.5 text-[#2a2620] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#5a6e3f] transition-colors"
              />
              <button className="bg-[#5a6e3f] hover:bg-[#6c8049] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
                Pull the answers
              </button>
            </div>
          </div>
        </div>
      </ShaderHero>
    </div>
  )
}
