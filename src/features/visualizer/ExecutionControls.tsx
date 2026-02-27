import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { useExecutionStore } from '@/store'
import { Button } from '@/components/ui'
import { interpret } from '@/utils/execution'
import { useEffect, useRef } from 'react'

export function ExecutionControls() {
  const {
    sourceCode,
    executionSteps,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    isExecuting,
    setExecutionSteps,
    nextStep,
    previousStep,
    togglePlay,
    reset,
    setSpeed,
    setIsExecuting,
    setError,
  } = useExecutionStore()

  const playIntervalRef = useRef<number | null>(null)

  // Run the interpreter
  const handleRun = () => {
    setIsExecuting(true)
    setError(null)

    try {
      const steps = interpret(sourceCode)
      setExecutionSteps(steps)
    } catch (error) {
      setError({
        type: 'Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStepIndex < executionSteps.length - 1) {
      playIntervalRef.current = window.setInterval(() => {
        nextStep()
      }, 1000 / playbackSpeed)
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, currentStepIndex, executionSteps.length, playbackSpeed, nextStep])

  // Stop playing when reaching the end
  useEffect(() => {
    if (isPlaying && currentStepIndex >= executionSteps.length - 1) {
      togglePlay()
    }
  }, [currentStepIndex, executionSteps.length, isPlaying, togglePlay])

  const currentStep = executionSteps[currentStepIndex]
  const hasSteps = executionSteps.length > 0
  const canGoBack = currentStepIndex > 0
  const canGoForward = currentStepIndex < executionSteps.length - 1

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 overflow-hidden">
      <div className="flex flex-wrap items-center gap-y-3 gap-x-4">
        {/* Run Button */}
        <Button
          onClick={handleRun}
          variant="primary"
          size="sm"
          disabled={isExecuting}
          className="min-w-[80px]"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-[var(--color-border)]" />

        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            onClick={reset}
            variant="ghost"
            size="sm"
            disabled={!hasSteps}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            onClick={previousStep}
            variant="ghost"
            size="sm"
            disabled={!canGoBack}
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            onClick={togglePlay}
            variant="secondary"
            size="sm"
            disabled={!hasSteps}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Button
            onClick={nextStep}
            variant="ghost"
            size="sm"
            disabled={!canGoForward}
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Step Counter */}
        {hasSteps && (
          <div className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
            Step{' '}
            <span className="font-mono text-[var(--color-text-primary)]">
              {currentStepIndex + 1}
            </span>{' '}
            of{' '}
            <span className="font-mono text-[var(--color-text-primary)]">
              {executionSteps.length}
            </span>
          </div>
        )}

        {/* Speed Control */}
        <div className="flex-1 min-w-[150px] flex items-center justify-end gap-2 ml-auto">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] whitespace-nowrap">Speed</span>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={playbackSpeed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-16 sm:w-24 accent-[var(--color-accent-blue)] cursor-pointer"
          />
          <span className="text-xs font-mono text-[var(--color-text-secondary)] w-8 text-right">
            {playbackSpeed}x
          </span>
        </div>
      </div>

      {/* Current Step Description */}
      {currentStep && (
        <div className="mt-2 px-2 py-1.5 rounded bg-[var(--color-bg-tertiary)] text-sm">
          <span className="text-[var(--color-accent-blue)] font-mono mr-2">
            [{currentStep.phase}]
          </span>
          <span className="text-[var(--color-text-primary)]">
            {currentStep.description}
          </span>
        </div>
      )}
    </div>
  )
}
