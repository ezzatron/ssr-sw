import {Link} from 'react-router5'

import SignOutLink from './SignOutLink.js'
import styles from './Nav.css'

export default function Nav () {
  return <nav className={styles.nav}>
    <ul>
      <li><Link routeName='home'>Home</Link></li>
      <li><Link routeName='sign-in'>Sign in</Link></li>
      <li><SignOutLink /></li>
      <li><Link routeName='foo'>Foo</Link></li>
      <li><Link routeName='bar'>Bar</Link></li>
      <li><Link routeName='client-only'>Client-only</Link></li>
      <li><Link routeName='server-only' routeOptions={{reload: true}}>Server-only</Link></li>
      <li><Link routeName='no-component'>No component</Link></li>
      <li><a href='/non-existent'>Non-existent</a></li>
    </ul>
  </nav>
}
