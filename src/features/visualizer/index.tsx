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
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-[420px] min-w-[320px] flex-shrink-0 border-r border-[var(--color-border)] flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditorPanel />
          </div>
          <ExecutionControls />
        </div>

        {/* Right: Visualization Panels */}
        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-3 gap-3 auto-rows-[220px]">
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
    </div>
  )
}
