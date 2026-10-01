import type { ReactNode } from 'react'

interface PageNoticeProps {
  tone: 'info' | 'danger'
  title: string
  children?: ReactNode
}

/** State sederhana untuk loading / error / kosong yang dipakai beberapa halaman. */
export default function PageNotice({ tone, title, children }: PageNoticeProps) {
  return (
    <section className="page">
      <div className={`notice notice--${tone}`}>
        <h2 className="notice__title">{title}</h2>
        {children ? <div className="notice__body">{children}</div> : null}
      </div>
    </section>
  )
}
