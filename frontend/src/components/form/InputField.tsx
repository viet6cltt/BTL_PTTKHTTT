import type { FieldProps } from '../../types'
import { baseInputClass } from './fieldStyles'
import { FieldShell } from './FieldShell'

export function InputField({ id, label, placeholder, required }: FieldProps) {
  return (
    <FieldShell id={id} label={label} required={required}>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        className={baseInputClass()}
      />
    </FieldShell>
  )
}
