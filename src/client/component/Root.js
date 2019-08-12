import React, {Fragment} from 'react'

import Main from './Main.js'
import Nav from './Nav.js'

export default function Root () {
  return <Fragment>
    <Nav />
    <Main />
  </Fragment>
}
