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
      <footer
        className="py-24 text-center"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        <p className="text-sm tracking-widest uppercase" style={{ color: '#5a5a6e' }}>
          Built with Three.js + WebGL
        </p>
      </footer>
    </div>
  )
}
