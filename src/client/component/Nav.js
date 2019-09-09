import {Link} from 'react-router5'

import AuthLink from './AuthLink.js'
import styles from './Nav.css'

export default function Nav () {
  return <nav className={styles.nav}>
    <ul>
      <li><Link routeName='home'>Home</Link></li>
      <li><Link routeName='dashboard'>Dashboard</Link></li>
      <li><AuthLink /></li>
      <li><Link routeName='client-only'>Client-only</Link></li>
      <li><Link routeName='server-only'>Server-only</Link></li>
      <li><Link routeName='server-error'>Server error</Link></li>
      <li><Link routeName='no-component'>No component</Link></li>
      <li><a href='/non-existent'>Non-existent</a></li>
      <li><Link routeName='a'>A</Link></li>
      <li><Link routeName='a.b'>A.B</Link></li>
      <li><Link routeName='a.b.c'>A.B.C</Link></li>
      <li><Link routeName='a.d'>A.D</Link></li>
    </ul>
  </nav>
}
