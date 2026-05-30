import { ChevronDown } from 'lucide-react'
import type { FieldProps, SelectOption } from '../../types'
import { baseInputClass } from './fieldStyles'
import { FieldShell } from './FieldShell'

type SelectFieldProps = FieldProps & {
  options: SelectOption[]
}

export function SelectField({
  id,
  label,
  placeholder,
  required,
  options,
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required}>
      <div className="relative">
        <select
          id={id}
          defaultValue=""
          aria-label={placeholder}
          className={baseInputClass('appearance-none pr-11 text-slate-400')}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />
      </div>
    </FieldShell>
  )
}
