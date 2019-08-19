import React from 'react'
import universal, {setHasBabelPlugin} from 'react-universal-component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

setHasBabelPlugin()

const Bar = universal(import(`./Bar.js`))
const Foo = universal(import(`./Foo.js`))
const NotFound = universal(import(`./NotFound.js`))

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('bar')) return <Bar />
  if (testRoute('foo')) return <Foo />

  return <NotFound />
}
