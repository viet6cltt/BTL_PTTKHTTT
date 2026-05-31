import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import type { FormEventHandler, ReactNode } from 'react'
import { FieldShell } from '../form/FieldShell'
import { baseInputClass } from '../form/fieldStyles'
import type { SelectOption } from '../../types'

const panelClass =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70'
const primaryButtonClass =
  'inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#5DF8D8] px-6 text-sm font-extrabold text-[#093C5D] shadow-lg shadow-teal-200/70 transition hover:bg-[#6FD1D7]'
const secondaryButtonClass =
  'inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#5DF8D8] hover:text-[#3B7597]'

type FilterPanelProps = {
  title: string
  children: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
  onReset: () => void
  submitLabel?: string
  resetLabel?: string
}

export function FilterPanel({
  title,
  children,
  onSubmit,
  onReset,
  submitLabel = 'Tìm kiếm',
  resetLabel = 'Đặt lại',
}: FilterPanelProps) {
  return (
    <form onSubmit={onSubmit} className={panelClass}>
      <div className="mb-5 flex items-center gap-3 text-[#0B3970]">
        <SlidersHorizontal className="h-6 w-6 text-[#126CB0]" />
        <h2 className="text-lg font-extrabold">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>

      <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
        <button type="button" onClick={onReset} className={secondaryButtonClass}>
          <RotateCcw className="h-4 w-4" />
          {resetLabel}
        </button>
        <button type="submit" className={primaryButtonClass}>
          <Search className="h-5 w-5" />
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

type FilterInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

type FilterTextInputProps = FilterInputProps & {
  placeholder: string
}

export function FilterTextInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: FilterTextInputProps) {
  return (
    <FieldShell id={id} label={label}>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={baseInputClass()}
      />
    </FieldShell>
  )
}

export function FilterDateInput({
  id,
  label,
  value,
  onChange,
}: FilterInputProps) {
  return (
    <FieldShell id={id} label={label}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={baseInputClass()}
      />
    </FieldShell>
  )
}

type FilterDateRangeProps = {
  label: string
  start: FilterInputProps
  end: FilterInputProps
}

export function FilterDateRange({ label, start, end }: FilterDateRangeProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-bold text-[#18395F]">{label}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterDateInput {...start} />
        <FilterDateInput {...end} />
      </div>
    </fieldset>
  )
}

type FilterSelectProps = FilterInputProps & {
  options: SelectOption[]
}

export function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <FieldShell id={id} label={label}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseInputClass(
            `appearance-none pr-11 ${
              value ? 'text-[#18395F]' : 'text-slate-400'
            }`,
          )}
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
