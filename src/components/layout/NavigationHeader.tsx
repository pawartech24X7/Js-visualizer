import { Code2, Menu, BookOpen, HelpCircle, Github } from 'lucide-react'
import { useUIStore, type ViewMode } from '@/store'

export function NavigationHeader() {
  const { toggleSidebar, viewMode, setViewMode } = useUIStore()

  const navItems: { mode: ViewMode; label: string; icon: typeof Code2 }[] = [
    { mode: 'visualizer', label: 'Visualizer', icon: Code2 },
    { mode: 'topics', label: 'Topics', icon: BookOpen },
    { mode: 'questions', label: 'Questions', icon: HelpCircle },
  ]

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center px-4 gap-4">
      {/* Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-[var(--color-text-primary)] hidden sm:block">
          JS Visualizer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 ml-4">
        {navItems.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${viewMode === mode
                ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:block">{label}</span>
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </header>
  )
}
