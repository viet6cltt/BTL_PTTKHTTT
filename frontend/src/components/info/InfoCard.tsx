import type { ReactNode } from 'react'

type InfoCardProps = {
  title: string
  icon: ReactNode
  children: ReactNode
  highlighted?: boolean
}

export function InfoCard({
  title,
  icon,
  children,
  highlighted,
}: InfoCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-200/70 ${
        highlighted ? 'border-sky-200' : 'border-slate-200'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-5 text-[#0B3970] ${
          highlighted ? 'bg-[#E8FFFB]' : ''
        }`}
      >
        {icon}
        <h2 className="text-base font-extrabold">{title}</h2>
      </div>
      <div className="px-7 py-6">{children}</div>
    </section>
  )
}
