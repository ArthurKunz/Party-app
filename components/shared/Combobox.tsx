'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface School {
    id: number,
    name: string,
    type: string,
    isPrivate: boolean
}


interface Props {
    topic: School[]
    value: string
    onChange: (val: string) => void
}

export default function Combobox({ topic, value, onChange }: Props) {
    const [query, setQuery] = useState(value)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const filtered = topic.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div ref={ref} className={cn('relative w-full')}>
            <input
                type='text'
                placeholder='Schule suchen …'
                value={query}
                className={cn(
                    'h-12 w-full rounded border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 text-xs text-[var(--color-light-body)] outline-none transition-[box-shadow,opacity] placeholder:text-xs placeholder:text-[var(--color-light-placeholder)]',
                )}
                onChange={(e) => {
                    setQuery(e.target.value)
                    onChange('')
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onMouseDown={(e) => {
                    if (open) {
                        setOpen(false)
                        return
                    }
                    if (e.currentTarget === document.activeElement) {
                        setOpen(true)
                    }
                }}
            />
            {open && filtered.length > 0 && (
                <ul
                    className={cn(
                        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-[var(--color-input-border)] bg-[var(--color-secondary)] py-1 shadow-lg',
                    )}
                >
                    {filtered.map(school => (
                        <li
                            key={school.id}
                            className={cn(
                                'cursor-pointer px-3 py-2 text-sm text-[var(--color-light-body)] hover:bg-[var(--color-brand)]/20',
                            )}
                            onMouseDown={(ev) => {
                                ev.preventDefault()
                                onChange(school.name)
                                setQuery(school.name)
                                setOpen(false)
                            }}
                        >
                            {school.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}