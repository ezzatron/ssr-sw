import {useCallback, useState} from 'react'

export default function ResponsiveImage (props) {
  const {alt, className, image, title} = props

  const {
    placeholder,
    src,
    srcSet,
  } = image

  const {
    height = image.height,
    width = image.width,
  } = props

  const [isLoaded, setIsLoaded] = useState(false)

  const handleImageRef = useCallback(
    img => { img && img.complete && setIsLoaded(true) },
    [setIsLoaded],
  )

  const handleLoad = useCallback(
    () => setIsLoaded(true),
    [setIsLoaded],
  )

  const divStyle = {
    width,
    height,

    position: 'relative',
  }

  const placeholderStyle = {
    width,
    height,

    display: 'block',
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundSize: 'cover',
    backgroundImage: `url(${placeholder})`,
    filter: 'blur(5px)',
    opacity: isLoaded ? '0' : '1',
    transition: 'opacity 300ms ease-out',
    transitionDelay: '200ms',
  }

  const imgStyle = {
    width,
    height,

    display: 'block',
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    right: '0',
    opacity: isLoaded ? '1' : '0',
    transition: 'opacity 300ms ease-in',
  }

  return <div className={className} style={divStyle} title={title}>
    <img
      alt={alt}
      src={placeholder}
      style={placeholderStyle}
    />
    <img
      alt={alt}
      ref={handleImageRef}
      src={src}
      srcSet={srcSet}
      style={imgStyle}
      onLoad={handleLoad}
    />
  </div>
}
