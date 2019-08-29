import barJpg from './Bar.jpg?placeholder=true&min=500&max=4000&steps=4'
import ResponsiveImage from './ResponsiveImage.js'
import styles from './Bar.css'

export default function Bar () {
  return <div className={styles.bar}>
    <h1>Bar</h1>

    <a
      title='Achim Schleuning [CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0)], via Wikimedia Commons'
      href='https://commons.wikimedia.org/wiki/File:Cocktail-Bar_(Kleines_Phi)_in_Hamburg.jpg'
    >
      <ResponsiveImage
        image={barJpg}
        width='621px'
        height='500px'
        className={styles.image}
        alt='Cocktail-Bar (Kleines Phi) in Hamburg'
        title="It's a bar. Get it?"
      />
    </a>
  </div>
}
