import './index.css'

function App() {
  return (
    <div className="relative min-h-screen bg-void">
      {/* Noise texture overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <header className="mb-16">
          <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-text-primary">
            The Examiner
          </h1>
          <p className="mt-2 font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.3em] text-text-muted">
            Socratic interrogation for your artefacts
          </p>
        </header>

        <div className="text-text-secondary font-[family-name:var(--font-mono)] text-sm">
          <p>System initializing...</p>
        </div>
      </main>
    </div>
  )
}

export default App
