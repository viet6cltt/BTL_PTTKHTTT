type MasterDataTypeBadgeProps = {
  label: string
}

export function MasterDataTypeBadge({ label }: MasterDataTypeBadgeProps) {
  return (
    <span className="inline-flex max-w-[220px] rounded-full bg-[#E8F5FF] px-3 py-1.5 text-xs font-extrabold leading-5 text-[#126CB0]">
      {label}
    </span>
  )
}

