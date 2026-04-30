import Hero from './sections/Hero'
import LogoBar from './sections/LogoBar'
import Features from './sections/Features'
import CallToAction from './sections/CallToAction'

export default function Scene() {
  return (
    <div className="w-full h-full overflow-y-auto bg-surface scroll-smooth">
      <Hero />
      <LogoBar />
      <Features />
      <CallToAction />
    </div>
  )
}
