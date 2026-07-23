interface BylineProps {
  avatar: string
  name: string
  date: string
}

const Byline = ({ avatar, name, date }: BylineProps) => {
  return (
    <address className="Byline">
      <img src={avatar} alt="" />
      <b>{name}</b>
      <time>{date}</time>
    </address>
  )
}

export default Byline
