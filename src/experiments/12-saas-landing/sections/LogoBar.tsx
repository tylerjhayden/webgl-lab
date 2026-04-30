const LOGOS = ['Vercel', 'Linear', 'Raycast', 'Supabase', 'Clerk', 'Resend']

export default function LogoBar() {
  return (
    <section className="border-y border-border-subtle bg-surface py-6">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-text-muted text-xs uppercase tracking-widest text-center mb-4">
          Trusted by teams at
        </p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="font-mono text-sm text-text-muted/60 tracking-wide select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
