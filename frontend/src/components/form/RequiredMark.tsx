export function RequiredMark({ show }: { show?: boolean }) {
  if (!show) {
    return null
  }

  return <span className="text-red-500">*</span>
}
