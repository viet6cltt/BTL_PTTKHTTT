import { ArrowUpDown } from 'lucide-react'
import { masterDataTableCellClass } from './masterDataStyles'

type MasterDataSortableHeaderProps = {
  label: string
}

export function MasterDataSortableHeader({
  label,
}: MasterDataSortableHeaderProps) {
  return (
    <th className={masterDataTableCellClass}>
      <span className="inline-flex items-center gap-1.5">
        {label}
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
      </span>
    </th>
  )
}

