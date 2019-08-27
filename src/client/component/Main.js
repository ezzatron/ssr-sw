import loadable from '@loadable/component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Loading from './Loading.js'
import NotFound from './NotFound.js'

const loadableOptions = {
  fallback: <Loading />,
}

const Bar = loadable(() => import('./Bar.js'), loadableOptions)
const Foo = loadable(() => import('./Foo.js'), loadableOptions)

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('bar')) return <Bar />
  if (testRoute('foo')) return <Foo />

  return <NotFound />
}
