import { useState } from 'react'

export const MASTER_DATA_PAGE_SIZE = 5

export function useMasterDataPagination<T>(
  items: T[],
  pageSize = MASTER_DATA_PAGE_SIZE,
) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pagedItems = items.slice(startIndex, startIndex + pageSize)
  const visibleStart = items.length === 0 ? 0 : startIndex + 1
  const visibleEnd = Math.min(startIndex + pageSize, items.length)

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function resetToFirstPage() {
    setPage(1)
  }

  return {
    currentPage,
    totalPages,
    pagedItems,
    visibleStart,
    visibleEnd,
    goToPage,
    resetToFirstPage,
  }
}

