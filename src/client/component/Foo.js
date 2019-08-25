import React from 'react'

import {foo as className} from './Foo.css'

export default function Foo () {
  return <div className={className}>
    <h1>Foo</h1>
  </div>
}
