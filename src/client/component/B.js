import loadable from '@loadable/component'

import Loading from './Loading.js'
// import RouteData from './RouteData.js'
import {useRouteNode} from '~/src/packula/router/react'

const loadableOptions = {
  fallback: <Loading />,
}

const C = loadable(() => import('./C.js'), loadableOptions)

export default function B () {
  const {name, params} = useRouteNode('a')

  return <>
    <h2>B</h2>

    {/* <RouteData name='b' />  */}

    {name === 'c' && <C params={params} />}
  </>
}
