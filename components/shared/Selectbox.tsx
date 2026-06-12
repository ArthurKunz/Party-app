'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export type SelectOption<Value extends string = string> = {
  value: Value
  label: ReactNode
  disabled?: boolean
}

export type SelectboxProps<Value extends string = string> = {
  options: SelectOption<Value>[]
  value: Value | ''
  onValueChange: (value: Value) => void
  placeholder?: ReactNode
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  triggerClassName?: string
  listboxClassName?: string
  optionClassName?: string
  center?: boolean
  emptyContent?: ReactNode
  renderSelected?: (option: SelectOption<Value> | undefined) => ReactNode
  'aria-label'?: string
  'aria-labelledby'?: string
}

export default function Selectbox<Value extends string = string>({
  options,
  value,
  onValueChange,
  placeholder = 'Choose…',
  disabled = false,
  id: idProp,
  name,
  className,
  triggerClassName,
  listboxClassName,
  optionClassName,
  center = false,
  emptyContent = 'No options',
  renderSelected,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectboxProps<Value>) {
  const reactId = useId()
  const listboxId = `${reactId}-listbox`
  const baseId = idProp ?? `${reactId}-trigger`

  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value],
  )

  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const enabledIndices = useMemo(
    () => options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0),
    [options],
  )

  const initialHighlightIndex = useMemo(() => {
    if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) return selectedIndex
    return enabledIndices[0] ?? 0
  }, [selectedIndex, options, enabledIndices])

  const openDropdown = useCallback(() => {
    setHighlightedIndex(initialHighlightIndex)
    setOpen(true)
  }, [initialHighlightIndex])

  const moveHighlight = useCallback(
    (delta: 1 | -1) => {
      if (enabledIndices.length === 0) return
      const currentPos = enabledIndices.indexOf(highlightedIndex)
      const nextPos =
        currentPos < 0
          ? delta === 1
            ? 0
            : enabledIndices.length - 1
          : (currentPos + delta + enabledIndices.length) % enabledIndices.length
      setHighlightedIndex(enabledIndices[nextPos]!)
    },
    [enabledIndices, highlightedIndex],
  )

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const commitHighlighted = useCallback(() => {
    const opt = options[highlightedIndex]
    if (opt && !opt.disabled) {
      onValueChange(opt.value)
      setOpen(false)
    }
  }, [highlightedIndex, onValueChange, options])

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          openDropdown()
        } else {
          moveHighlight(1)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) {
          openDropdown()
        } else {
          moveHighlight(-1)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) commitHighlighted()
        else openDropdown()
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        break
    }
  }

  const displayLabel = renderSelected
    ? renderSelected(selectedOption)
    : (selectedOption?.label ?? placeholder)

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      {name !== undefined && (
        <input type='hidden' name={name} value={value} readOnly aria-hidden />
      )}
      <button
        type='button'
        id={baseId}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          'flex h-12 w-full items-center rounded-xl border border-border-input bg-background-input px-4 text-sm text-input outline-none disabled:cursor-not-allowed disabled:opacity-50',
          center ? 'justify-center' : 'justify-between',
          triggerClassName,
        )}
        onClick={() => {
          if (disabled) return
          if (open) setOpen(false)
          else openDropdown()
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className={cn(
            'min-w-0 truncate',
            center ? 'w-full text-center' : 'flex-1 text-center',
            !selectedOption && 'text-placeholder',
          )}
        >
          {displayLabel}
        </span>
      </button>

      {open && (
        <ul
          id={listboxId}
          role='listbox'
          aria-labelledby={baseId}
          className={cn(
            'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border-input bg-background-input py-1 shadow-lg',
            listboxClassName,
          )}
        >
          {options.length === 0 ? (
            <li className='px-3 py-2 text-sm text-[var(--color-light-muted)]'>{emptyContent}</li>
          ) : (
            options.map((opt, index) => {
              const isSelected = opt.value === value
              const isHighlighted = index === highlightedIndex
              return (
                <li
                  key={String(opt.value)}
                  role='option'
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled ?? false}
                  id={`${listboxId}-opt-${index}`}
                  className={cn(
                    'cursor-pointer px-3 py-2 text-sm text-input text-center',
                    isSelected && 'font-medium',
                    opt.disabled && 'cursor-not-allowed opacity-40',
                    optionClassName,
                  )}
                  onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (opt.disabled) return
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
