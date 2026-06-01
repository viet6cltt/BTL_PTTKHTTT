import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { masterDataIconButtonClass } from './masterDataStyles'

type MasterDataPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function MasterDataPagination({
  currentPage,
  totalPages,
  onPageChange,
}: MasterDataPaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-end">
      <div className="flex flex-wrap items-center gap-2">
        <PaginationButton
          ariaLabel="Trang đầu"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton
          ariaLabel="Trang trước"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`grid h-9 min-w-9 place-items-center rounded-lg px-3 text-sm font-extrabold transition ${
              pageNumber === currentPage
                ? 'bg-[#5DF8D8] text-[#093C5D] shadow-md shadow-teal-200/60'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-[#5DF8D8] hover:text-[#3B7597]'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <PaginationButton
          ariaLabel="Trang sau"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton
          ariaLabel="Trang cuối"
          disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  )
}

type PaginationButtonProps = {
  ariaLabel: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function PaginationButton({
  ariaLabel,
  disabled,
  onClick,
  children,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={masterDataIconButtonClass}
    >
      {children}
    </button>
  )
}

