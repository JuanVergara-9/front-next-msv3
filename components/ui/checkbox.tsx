'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Alto contraste por defecto (desmarcado)
        'peer size-4 shrink-0 rounded-[4px] border border-border bg-background shadow-xs outline-none transition-colors',
        // Marcado
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary',
        // Enfoque y accesibilidad
        'focus-visible:ring-[3px] focus-visible:ring-primary/40 focus-visible:border-primary aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        // Temas oscuros
        'dark:bg-background/40 dark:border-white/20 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary dark:aria-invalid:ring-destructive/40',
        // Estados
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
