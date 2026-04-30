import { ShaderHero } from '../../components/ShaderHero'
import fragmentShader from './shaders/signal.frag'

const METRICS = [
  { value: '10M+', label: 'API requests' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'P99 latency' },
  { value: '2,000+', label: 'Teams worldwide' },
]

export default function Scene() {
  return (
    <ShaderHero fragmentShader={fragmentShader} interactive dpr={[1, 1.5]}>
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-4xl w-full space-y-10">
          <h2 className="text-center text-2xl font-semibold text-text-primary tracking-tight">
            Trusted by teams that ship
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-auto">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="bg-surface-raised/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6 text-center"
              >
                <div className="font-mono text-3xl font-bold text-text-primary">
                  {metric.value}
                </div>
                <div className="text-text-muted text-sm mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
