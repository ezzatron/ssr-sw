import loadable from '@loadable/component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Loading from './Loading.js'
import NotFound from './NotFound.js'

const loadableOptions = {
  fallback: <Loading />,
}

const Bar = loadable(() => import('./Bar.js'), loadableOptions)
const ClientOnly = loadable(() => import('./ClientOnly.js'), loadableOptions)
const Foo = loadable(() => import(/* webpackPrefetch: true */ './Foo.js'), loadableOptions)
const SignIn = loadable(() => import(/* webpackPrefetch: true */ './SignIn.js'), loadableOptions)

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('bar')) return <Bar />
  if (testRoute('sign-in')) return <SignIn />
  if (testRoute('client-only')) return <ClientOnly />
  if (testRoute('foo')) return <Foo />

  return <NotFound />
}
