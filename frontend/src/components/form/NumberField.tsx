import type { FieldProps } from '../../types'
import { baseInputClass } from './fieldStyles'
import { FieldShell } from './FieldShell'

export function NumberField({ id, label, placeholder, required }: FieldProps) {
  return (
    <FieldShell id={id} label={label} required={required}>
      <input
        id={id}
        min="1"
        type="number"
        placeholder={placeholder}
        className={baseInputClass('pr-3')}
      />
    </FieldShell>
  )
}
