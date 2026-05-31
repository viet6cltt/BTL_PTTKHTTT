import { Calendar } from 'lucide-react'
import type { FieldProps } from '../../types'
import { baseInputClass } from './fieldStyles'
import { FieldShell } from './FieldShell'

export function DateField({ id, label, placeholder, required }: FieldProps) {
  return (
    <FieldShell id={id} label={label} required={required}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="date"
          placeholder={placeholder}
          className={baseInputClass('pr-12')}
        />
        <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
      </div>
    </FieldShell>
  )
}
