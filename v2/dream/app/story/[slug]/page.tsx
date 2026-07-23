import Story, { type StoryData } from '../../../components/story'
import Gallery from '../../../components/gallery'

const story: StoryData = {
  title: 'A Door Opens in the Fourteenth Universe',
  subtitle: 'Nobody expected it to be unlocked',
  snippet: 'The handle turned easily, as if it had been waiting…',
  image: '/img/fourteenth-door.jpg',
  link: '/story/fourteenth-door',
  author: {
    avatar: '/img/authors/vera.jpg',
    name: 'Vera Klimova',
    date: '2026-07-23',
  },
}

const images: string[] = []
const related: StoryData[] = []

const StoryPage = () => {
  return (
    <main className="StoryPage">
      <Story {...story} />
      <Gallery images={images} caption="Field photos" />
      <nav className="related">
        <h3>Related</h3>
        {related.map((story) => (
          <Story key={story.link} compact {...story} />
        ))}
      </nav>
    </main>
  )
}

export default StoryPage
