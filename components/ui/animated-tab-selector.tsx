'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedTabSelectorProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string; badge?: number; beta?: boolean }>
  className?: string
  variant?: 'default' | 'blue-white'
  size?: 'default' | 'large'
}

export function AnimatedTabSelector({
  value,
  onValueChange,
  options,
  className,
  variant = 'default',
  size = 'default'
}: AnimatedTabSelectorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const hasMovedRef = React.useRef(false)
  const mouseStartRef = React.useRef<number | null>(null)
  const preventClickRef = React.useRef(false)

  // Distancia mínima para considerar un swipe
  const minSwipeDistance = 50

  const activeIndex = options.findIndex((opt) => opt.value === value)

  const handleSwipe = React.useCallback((startX: number, endX: number, currentIndex: number) => {
    const distance = startX - endX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < options.length - 1) {
      // Swipe a la izquierda: ir a la siguiente opción
      onValueChange(options[currentIndex + 1].value)
    }

    if (isRightSwipe && currentIndex > 0) {
      // Swipe a la derecha: ir a la opción anterior
      onValueChange(options[currentIndex - 1].value)
    }
  }, [options, onValueChange])

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
    hasMovedRef.current = false
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    hasMovedRef.current = true
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false)
      return
    }

    if (hasMovedRef.current) {
      handleSwipe(touchStart, touchEnd, activeIndex)
    }
    setTouchStart(null)
    setTouchEnd(null)
    setIsDragging(false)
    hasMovedRef.current = false
  }

  // Soporte para mouse drag
  React.useEffect(() => {
    if (!isDragging || mouseStartRef.current === null) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || mouseStartRef.current === null) return

      const currentX = e.clientX
      const startX = mouseStartRef.current

      // Actualizar la posición final incluso si no se ha movido mucho
      setTouchEnd(currentX)

      // Verificar si el mouse se ha movido lo suficiente para considerarlo un drag
      if (Math.abs(currentX - startX) > 3) {
        hasMovedRef.current = true
        preventClickRef.current = true // Prevenir click si hay movimiento
      }
    }

    const handleMouseUp = () => {
      const startX = mouseStartRef.current
      const endX = touchEnd
      const moved = hasMovedRef.current

      if (startX !== null && endX !== null && moved) {
        // Si hubo movimiento, prevenir el click y ejecutar el swipe
        preventClickRef.current = true
        handleSwipe(startX, endX, activeIndex)
        // Reset inmediatamente después del swipe
        mouseStartRef.current = null
        setTouchStart(null)
        setTouchEnd(null)
        setIsDragging(false)
        hasMovedRef.current = false
        // Mantener preventClick por un momento para evitar clicks accidentales
        setTimeout(() => {
          preventClickRef.current = false
        }, 200)
      } else {
        // No hubo movimiento, permitir click
        preventClickRef.current = false
        mouseStartRef.current = null
        setTouchStart(null)
        setTouchEnd(null)
        setIsDragging(false)
        hasMovedRef.current = false
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, touchEnd, activeIndex, handleSwipe])

  // Usar ref para el contenedor y capturar eventos en fase de captura
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseDownCapture = (e: MouseEvent) => {
      if (e.button !== 0) return

      // Prevenir el comportamiento por defecto del botón si es necesario
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON') {
        // No prevenir aquí, solo marcar que empezamos el drag
      }

      setIsDragging(true)
      const startX = e.clientX
      mouseStartRef.current = startX
      setTouchStart(startX)
      setTouchEnd(null)
      hasMovedRef.current = false
      preventClickRef.current = false
    }

    // Capturar en fase de captura para interceptar antes de los botones
    container.addEventListener('mousedown', handleMouseDownCapture, true)
    container.addEventListener('touchstart', (e) => {
      // Para touch, el onTouchStart ya maneja esto, pero asegurémonos de que funcione
    }, { passive: true })

    return () => {
      container.removeEventListener('mousedown', handleMouseDownCapture, true)
    }
  }, [])

  const handleButtonClick = React.useCallback((optionValue: string, e: React.MouseEvent) => {
    // Si hubo drag, prevenir el click
    // Usar un pequeño delay para verificar el estado después de que termine el drag
    const wasDragging = preventClickRef.current || hasMovedRef.current

    if (wasDragging) {
      e.preventDefault()
      e.stopPropagation()
      // Reset después de un momento
      setTimeout(() => {
        preventClickRef.current = false
        hasMovedRef.current = false
      }, 100)
      return
    }
    onValueChange(optionValue)
  }, [onValueChange])

  // Calcular el número de columnas dinámicamente
  const numColumns = options.length

  // Estilos según la variante
  const containerStyles = variant === 'blue-white'
    ? 'bg-white rounded-xl shadow-lg'
    : 'bg-blue-50 rounded-lg'

  const paddingStyles = size === 'large'
    ? 'p-2'
    : variant === 'blue-white' ? 'p-1' : 'p-1.5'

  const indicatorStyles = variant === 'blue-white'
    ? 'bg-[#2563EB] rounded-lg'
    : 'bg-white rounded-lg shadow-sm'

  const activeTextStyles = variant === 'blue-white'
    ? 'text-white font-semibold'
    : 'text-[#1e40af] font-semibold'

  const inactiveTextStyles = variant === 'blue-white'
    ? 'text-[#111827] font-medium'
    : 'text-[#1e40af] opacity-70 hover:opacity-100'

  const buttonPadding = size === 'large'
    ? 'py-4 px-6'
    : variant === 'blue-white' ? 'py-2 px-4' : 'py-3 px-4'

  const textSize = size === 'large'
    ? 'text-base'
    : variant === 'blue-white' ? 'text-sm' : 'text-sm'

  // Calcular el ancho del indicador basado en el número de columnas
  // Con grid, cada columna ocupa 100% / numColumns del ancho disponible
  // El padding del contenedor ya está considerado
  const paddingRem = size === 'large'
    ? 0.5
    : variant === 'blue-white'
      ? 0.25  // p-1 = 0.25rem
      : 0.375 // p-1.5 = 0.375rem
  const indicatorWidth = `calc((100% - ${paddingRem * 2}rem) / ${numColumns})`
  const indicatorLeft = `${paddingRem}rem`

  // Generar clase de grid dinámicamente (solo para 2 o 3 columnas comúnmente)
  // Asegurar que el grid funcione correctamente con Tailwind
  const gridColsClass =
    numColumns === 2 ? 'grid-cols-2' :
      numColumns === 3 ? 'grid-cols-3' :
        numColumns === 4 ? 'grid-cols-4' :
          'grid'

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden select-none cursor-pointer',
        containerStyles,
        paddingStyles,
        'grid',
        'gap-0',
        className
      )}
      style={{
        direction: 'ltr', // Forzar dirección de izquierda a derecha
        gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` // Usar estilo inline para asegurar que funcione
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Indicador deslizante animado */}
      <div
        className={cn(
          'absolute transition-transform duration-300 ease-out z-0',
          variant === 'blue-white' ? 'top-1 bottom-1' : 'top-1.5 bottom-1.5',
          indicatorStyles
        )}
        style={{
          width: indicatorWidth,
          transform: `translateX(${activeIndex * 100}%)`,
          left: indicatorLeft,
        }}
        aria-hidden="true"
      />

      {/* Opciones */}
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={(e) => {
            // Solo cambiar si no hubo drag
            if (!preventClickRef.current && !hasMovedRef.current) {
              onValueChange(option.value)
            }
          }}
          onMouseDown={(e) => {
            // No hacer nada aquí, dejar que el contenedor maneje el drag
            // Esto permite que el drag funcione desde cualquier parte
          }}
          className={cn(
            'relative z-10 font-medium rounded-lg transition-colors duration-200 text-center cursor-pointer',
            buttonPadding,
            textSize,
            value === option.value
              ? activeTextStyles
              : inactiveTextStyles
          )}
          role="tab"
          aria-selected={value === option.value}
        >
          {option.beta && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-yellow-500 text-yellow-900 shadow-sm z-20">
              BETA
            </span>
          )}
          <div className="flex items-center justify-center gap-2">
            {option.label}
            {option.badge && option.badge > 0 && (
              <span className={cn(
                "flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full",
                value === option.value
                  ? (variant === 'blue-white' ? "bg-white text-[#2563EB]" : "bg-[#2563EB] text-white")
                  : (variant === 'blue-white' ? "bg-[#2563EB] text-white" : "bg-blue-200 text-[#1e40af]")
              )}>
                {option.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

