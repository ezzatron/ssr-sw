import React from 'react'
import {Link} from 'react-router5'

export default function Nav () {
  return <nav>
    <ul>
      <li><Link routeName='home'>Home</Link></li>
      <li><Link routeName='foo'>Foo</Link></li>
      <li><Link routeName='bar'>Bar</Link></li>
      <li><a href='/non-existent'>Non-existent</a></li>
    </ul>
  </nav>
}
