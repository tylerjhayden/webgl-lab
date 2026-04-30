const THEME = {
  '--color-accent': '#C97A3D',
  '--color-accent-hover': '#A86530',
} as React.CSSProperties

export default function CallToAction() {
  return (
    <section className="relative w-full bg-surface border-t border-border-subtle" style={THEME}>
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-24">
        <div className="max-w-xl text-center space-y-6">
          <h2 className="text-4xl font-bold text-text-primary leading-tight">
            Ready to ship?
          </h2>

          <p className="text-text-secondary text-lg leading-relaxed">
            Join thousands of teams building on infrastructure
            <br />
            that just works.
          </p>

          <code className="block font-mono text-sm text-text-muted py-2">
            $ npm install @acme/cli
          </code>

          <button className="bg-accent hover:bg-accent-hover text-white font-medium px-8 py-3 rounded-lg text-sm transition-colors">
            Start building — free
          </button>
        </div>
      </div>
    </section>
  )
}
