interface GalleryProps {
  images: string[]
  caption?: string
}

const Gallery = ({ images, caption }: GalleryProps) => {
  return (
    <figure className="Gallery">
      {images.map((src) => (
        <img key={src} src={src} alt="" />
      ))}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export default Gallery
