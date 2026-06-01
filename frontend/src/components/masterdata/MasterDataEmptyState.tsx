import { Inbox } from 'lucide-react'

type MasterDataEmptyStateProps = {
  resourceName: string
}

export function MasterDataEmptyState({
  resourceName,
}: MasterDataEmptyStateProps) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-[#092F5A]">
        Không tìm thấy {resourceName}
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Thử thay đổi từ khóa tìm kiếm.
      </p>
    </div>
  )
}

