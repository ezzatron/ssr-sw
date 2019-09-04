import loadable from '@loadable/component'
import {startsWithSegment} from 'router5-helpers'
import {useRouteNode} from 'react-router5'

import Loading from './Loading.js'
import NotFound from './NotFound.js'

const loadableOptions = {
  fallback: <Loading />,
}

const Universal = loadable(() => import('./Universal.js'), loadableOptions)
const ClientOnly = loadable(() => import('./ClientOnly.js'), loadableOptions)
const Dashboard = loadable(() => import(/* webpackPrefetch: true */ './Dashboard.js'), loadableOptions)
const SignIn = loadable(() => import(/* webpackPrefetch: true */ './SignIn.js'), loadableOptions)

export default function Main () {
  const {route} = useRouteNode('')
  const testRoute = startsWithSegment(route)

  if (testRoute('universal')) return <Universal />
  if (testRoute('sign-in')) return <SignIn />
  if (testRoute('client-only')) return <ClientOnly />
  if (testRoute('dashboard')) return <Dashboard />

  return <NotFound />
}
