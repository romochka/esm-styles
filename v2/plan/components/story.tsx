interface StoryProps {
  title: string
  subtitle: string
  snippet: string
  image: string
  link: string
}

const Story = ({ title, subtitle, snippet, image, link }: StoryProps) => {
  return (
    <article className="Story">
      <header>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
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
