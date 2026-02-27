import { useState, useCallback, useEffect } from 'react'
import { CodeEditorPanel } from './CodeEditorPanel'
import { ExecutionControls } from './ExecutionControls'
import {
  CallStackPanel,
  ExecutionContextPanel,
  MemoryPanel,
  WebApiPanel,
  MicroTaskQueuePanel,
  TaskQueuePanel,
  PromiseStatePanel,
  EventLoopAnimation,
  ConsolePanel,
} from './panels'

export function VisualizerPage() {
  const [leftWidth, setLeftWidth] = useState(420)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback(() => {
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX
        const minWidth = window.innerWidth * 0.5
        if (newWidth >= 320 && newWidth <= minWidth) {
          setLeftWidth(newWidth)
        }
      }
    },
    [isResizing]
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Left: Code Editor Container */}
      <div
        className="flex flex-col flex-shrink-0 relative"
        style={{ width: `${leftWidth}px` }}
      >
        <div className="flex-1 overflow-hidden">
          <CodeEditorPanel />
        </div>
        <ExecutionControls />

        {/* Resizable Divider */}
        <div
          onMouseDown={startResizing}
          className={`
            absolute top-0 right-0 w-1 h-full cursor-col-resize z-50 transition-colors
            ${isResizing ? 'bg-[var(--color-accent-blue)]' : 'bg-transparent hover:bg-[var(--color-accent-blue)]/30'}
          `}
        />
      </div>

      {/* Right: Visualization Panels Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar bg-[var(--color-bg-secondary)]/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-[350px]">
          {/* Row 1 */}
          <CallStackPanel />
          <ExecutionContextPanel />
          <MemoryPanel />

          {/* Row 2 */}
          <WebApiPanel />
          <MicroTaskQueuePanel />
          <TaskQueuePanel />

          {/* Row 3 */}
          <PromiseStatePanel />
          <EventLoopAnimation />
          <ConsolePanel />
        </div>
      </div>
    </div>
  )
}
