import type { ReactNode } from 'react'
import Nav from '../components/nav'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <body className="Layout">
      <header>
        <a href="/" className="logo">
          Multiverse Daily
        </a>
        <Nav />
      </header>
      {children}
      <footer>
        <small>© 2026 Multiverse Daily</small>
      </footer>
    </body>
  )
}

export default Layout
