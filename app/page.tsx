import { STCCalculator } from "@/components/stc-calculator"
import { RecentCalculations } from "@/components/recent-calculations"
import { Sun } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-8 w-8 text-primary" />
                <span className="text-xl font-semibold text-foreground">STC Calculator</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <a href="#calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                  Calculator
                </a>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About STCs
                </a>
                <a href="#zones" className="text-muted-foreground hover:text-foreground transition-colors">
                  Zone Map
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
                Calculate Your Solar STC Credits
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
                Small-scale Technology Certificates (STCs) help reduce the upfront cost of your solar installation.
                Calculate your estimated STC value instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <STCCalculator />
              <RecentCalculations />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section id="about" className="py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Sun className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">What are STCs?</h3>
                <p className="text-sm text-muted-foreground">
                  STCs are tradable certificates created when you install an eligible solar system. They reduce your
                  upfront installation cost.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Sun className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Zone-Based</h3>
                <p className="text-sm text-muted-foreground">
                  Australia is divided into 4 zones based on solar radiation levels. Higher zones receive more sunlight
                  and generate more STCs.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Sun className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Financial Benefit</h3>
                <p className="text-sm text-muted-foreground">
                  STCs can reduce your solar system cost by thousands of dollars, making renewable energy more
                  accessible.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
