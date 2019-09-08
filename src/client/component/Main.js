import loadable from '@loadable/component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Loading from './Loading.js'
import NotFound from './NotFound.js'

const loadableOptions = {
  fallback: <Loading />,
}

const A = loadable(() => import('./A.js'), loadableOptions)
const ClientOnly = loadable(() => import('./ClientOnly.js'), loadableOptions)
const Dashboard = loadable(() => import(/* webpackPrefetch: true */ './Dashboard.js'), loadableOptions)
const SignIn = loadable(() => import('./SignIn.js'), loadableOptions)
const SignOut = loadable(() => import('./SignOut.js'), loadableOptions)

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('dashboard')) return <Dashboard />
  if (testRoute('sign-in')) return <SignIn />
  if (testRoute('sign-out')) return <SignOut />

  if (testRoute('a')) return <A />
  if (testRoute('client-only')) return <ClientOnly />

  return <NotFound />
}
