import { MapPin } from 'lucide-react'
import { baseInputClass } from './fieldStyles'
import { FieldShell } from './FieldShell'

export function CityField() {
  return (
    <FieldShell id="city" label="Thành phố tổ chức" required>
      <div className="relative">
        <input
          id="city"
          type="text"
          placeholder="Nhập và chọn thành phố"
          className={baseInputClass('pr-12')}
        />
        <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
      </div>
    </FieldShell>
  )
}
