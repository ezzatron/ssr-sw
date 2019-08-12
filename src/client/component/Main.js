import React from 'react'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Bar from './Bar.js'
import Foo from './Foo.js'
import NotFound from './NotFound.js'

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('bar')) return <Bar />
  if (testRoute('foo')) return <Foo />

  return <NotFound />
}
