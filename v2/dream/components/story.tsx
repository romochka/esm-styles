import Byline from './byline'

export interface StoryData {
  title: string
  subtitle: string
  snippet: string
  image: string
  link: string
  author: { avatar: string; name: string; date: string }
}

interface StoryProps extends StoryData {
  compact?: boolean
  urgent?: boolean
}

const Story = ({
  title,
  subtitle,
  snippet,
  image,
  link,
  author,
  compact,
  urgent,
}: StoryProps) => {
  const className = [
    'Story',
    compact && 'compact',
    urgent && 'urgent',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={className}>
      <header>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <Byline {...author} />
      <main>
        <img src={image} alt={title} />
        <p>{snippet}</p>
      </main>
      <footer>
        <a href={link} target="_blank" rel="noopener noreferrer">
          Read more
        </a>
      </footer>
    </article>
  )
}

export default Story
