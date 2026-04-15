import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-bold">
            W
          </div>
          <span className="text-text-primary font-semibold text-lg tracking-tight">
            WebGL Lab
          </span>
        </Link>
        <a
          href="https://r3f.docs.pmnd.rs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted text-sm hover:text-text-secondary transition-colors"
        >
          R3F Docs
        </a>
      </nav>
      <Outlet />
    </div>
  )
}
