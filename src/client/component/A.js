import loadable from '@loadable/component'

import Loading from './Loading.js'
// import RouteData from './RouteData.js'
import {useRouteNode} from '~/src/packula/router/react'

const loadableOptions = {
  fallback: <Loading />,
}

const B = loadable(() => import('./B.js'), loadableOptions)
const D = loadable(() => import('./D.js'), loadableOptions)

export default function A () {
  const {name, params} = useRouteNode('a')

  return <>
    <h1>A</h1>

    {/* <RouteData name='a' />  */}

    {name === 'b' && <B params={params} />}
    {name === 'd' && <D params={params} />}
  </>
}
