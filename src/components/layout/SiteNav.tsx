import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', end: true },
  { to: '/explorer', label: 'Data Explorer' },
  { to: '/sources', label: 'Sources' },
  { to: '/data', label: 'Schema / Import' },
]

export default function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
