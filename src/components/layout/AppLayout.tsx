import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store'

interface AppLayoutProps {
  children: ReactNode
  header?: ReactNode
  sidebar?: ReactNode
}

export function AppLayout({ children, header, sidebar }: AppLayoutProps) {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      {header}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 280 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="h-full overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
        >
          {sidebar}
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
