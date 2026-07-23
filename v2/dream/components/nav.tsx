const Nav = ({ open }: { open?: boolean }) => {
  return (
    <nav className={open ? 'Nav open' : 'Nav'}>
      <button aria-label="Menu">☰</button>
      <ul>
        <li>
          <a href="/" className="active">
            Today
          </a>
        </li>
        <li>
          <a href="/archive">Archive</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
      </ul>
    </nav>
  )
}

export default Nav
