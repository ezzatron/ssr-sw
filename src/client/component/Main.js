import loadable from '@loadable/component'
import React from 'react'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

const Bar = loadable(() => import(`./Bar.js`))
const Foo = loadable(() => import(`./Foo.js`))
const NotFound = loadable(() => import(`./NotFound.js`))

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('bar')) return <Bar />
  if (testRoute('foo')) return <Foo />

  return <NotFound />
}
