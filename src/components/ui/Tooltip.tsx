import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { clsx } from 'clsx'

export const TooltipProvider = TooltipPrimitive.Provider
export const TooltipRoot = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger
export const TooltipPortal = TooltipPrimitive.Portal

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={clsx(
      'z-50 overflow-hidden rounded-md bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border border-[var(--color-border)] max-w-[250px]',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  delayDuration?: number
}

export function Tooltip({ content, children, delayDuration = 300 }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            {content}
            <TooltipPrimitive.Arrow className="fill-[var(--color-border)]" />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  )
}
