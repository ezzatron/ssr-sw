import loadable from '@loadable/component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Loading from './Loading.js'
import RouteData from './RouteData.js'

const loadableOptions = {
  fallback: <Loading />,
}

const C = loadable(() => import('./C.js'), loadableOptions)

export default function B () {
  const {route} = useRouteNode('a.b')
  const testRoute = startsWithSegment(route)

  return <>
    <h2>B</h2>

    <RouteData name='b' />

    {testRoute('a.b.c') && <C />}
  </>
}
