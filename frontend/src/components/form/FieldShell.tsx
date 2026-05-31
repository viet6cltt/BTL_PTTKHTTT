import type { ReactNode } from 'react'
import type { FieldProps } from '../../types'
import { RequiredMark } from './RequiredMark'

type FieldShellProps = Pick<FieldProps, 'id' | 'label' | 'required'> & {
  children: ReactNode
}

export function FieldShell({ id, label, required, children }: FieldShellProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-3 flex items-center gap-1 text-sm font-bold text-[#18395F]">
        {label} <RequiredMark show={required} />
      </span>
      {children}
    </label>
  )
}
