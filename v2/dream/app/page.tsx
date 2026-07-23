import Story, { type StoryData } from '../components/story'

const stories: StoryData[] = [] // данные вообразим позже

const HomePage = () => {
  return (
    <main className="HomePage">
      <h2>Today</h2>
      <section className="feed">
        {stories.map((story) => (
          <Story key={story.link} compact {...story} />
        ))}
      </section>
    </main>
  )
}

export default HomePage
