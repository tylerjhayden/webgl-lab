import Hero from './Hero'
import Work from './Work'
import CursorTrail from './CursorTrail'

export default function Scene() {
  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{ background: '#06060a', scrollBehavior: 'smooth' }}
    >
      <CursorTrail />
      <Hero />
      <Work />

      {/* Footer */}
      <footer className="relative px-8 md:px-12 pt-16 pb-12" style={{ background: '#06060a' }}>
        <div className="h-px mb-8" style={{ background: '#1a1a28' }} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "'Space Mono', monospace", color: '#2a2a3a' }}
          >
            Built with Three.js + WebGL
          </p>
          <p
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "'Space Mono', monospace", color: '#1a1a28' }}
          >
            WebGL Lab / 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
