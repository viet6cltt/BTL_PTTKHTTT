import type { ReactNode } from 'react'
import { MasterDataPagination } from './MasterDataPagination'
import { MasterDataSearchHeader } from './MasterDataSearchHeader'

type MasterDataTableCardProps = {
  title: string
  visibleStart: number
  visibleEnd: number
  totalItems: number
  searchLabel: string
  searchPlaceholder: string
  searchTerm: string
  createLabel: string
  minTableWidthClass: string
  currentPage: number
  totalPages: number
  children: ReactNode
  onSearchChange: (value: string) => void
  onCreate: () => void
  onPageChange: (page: number) => void
}

export function MasterDataTableCard({
  title,
  visibleStart,
  visibleEnd,
  totalItems,
  searchLabel,
  searchPlaceholder,
  searchTerm,
  createLabel,
  minTableWidthClass,
  currentPage,
  totalPages,
  children,
  onSearchChange,
  onCreate,
  onPageChange,
}: MasterDataTableCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <MasterDataSearchHeader
        title={title}
        visibleStart={visibleStart}
        visibleEnd={visibleEnd}
        totalItems={totalItems}
        searchLabel={searchLabel}
        searchPlaceholder={searchPlaceholder}
        searchTerm={searchTerm}
        createLabel={createLabel}
        onSearchChange={onSearchChange}
        onCreate={onCreate}
      />

      <div className="overflow-x-auto">
        <table
          className={`w-full ${minTableWidthClass} border-collapse text-left`}
        >
          {children}
        </table>
      </div>

      <MasterDataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  )
}

