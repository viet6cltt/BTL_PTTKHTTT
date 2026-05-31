import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: string
  icon: ReactNode
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <section className="flex items-center gap-6">
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#A9FFF0] text-[#093C5D] shadow-lg shadow-teal-200/50">
        {icon}
      </div>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#092F5A] md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-slate-500">{description}</p>
      </div>
    </section>
  )
}
