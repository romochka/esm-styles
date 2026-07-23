interface ArchiveEntry {
  title: string
  link: string
  date: string
}

const years: { year: number; entries: ArchiveEntry[] }[] = []

const ArchivePage = () => {
  return (
    <main className="ArchivePage">
      <h2>Archive</h2>
      {years.map(({ year, entries }) => (
        <section key={year}>
          <h3>{year}</h3>
          <ul>
            {entries.map((entry) => (
              <li key={entry.link}>
                <a href={entry.link}>{entry.title}</a>
                <time>{entry.date}</time>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

export default ArchivePage
