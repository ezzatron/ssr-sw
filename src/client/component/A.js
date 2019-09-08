import loadable from '@loadable/component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Loading from './Loading.js'
import RouteData from './RouteData.js'

const loadableOptions = {
  fallback: <Loading />,
}

const B = loadable(() => import('./B.js'), loadableOptions)
const D = loadable(() => import('./D.js'), loadableOptions)

export default function A () {
  const {route} = useRouteNode('a')
  const testRoute = startsWithSegment(route)

  return <>
    <h1>A</h1>

    <RouteData name='a' />

    {testRoute('a.b') && <B />}
    {testRoute('a.d') && <D />}
  </>
}
