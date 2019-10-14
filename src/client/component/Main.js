import loadable from '@loadable/component'

import Loading from './Loading.js'
import NotFound from './NotFound.js'
import {useRouteNode} from '~/src/packula/router/react'

const loadableOptions = {
  fallback: <Loading />,
}

const A = loadable(() => import('./A.js'), loadableOptions)
const ClientOnly = loadable(() => import('./ClientOnly.js'), loadableOptions)
const Dashboard = loadable(() => import(/* webpackPrefetch: true */ './Dashboard.js'), loadableOptions)
const SignIn = loadable(() => import('./SignIn.js'), loadableOptions)
const SignOut = loadable(() => import('./SignOut.js'), loadableOptions)

export default function Main () {
  const {name, params} = useRouteNode()

  if (name === 'dashboard') return <Dashboard params={params} />
  if (name === 'sign-in') return <SignIn params={params} />
  if (name === 'sign-out') return <SignOut params={params} />

  if (name === 'a') return <A params={params} />
  if (name === 'client-only') return <ClientOnly params={params} />

  return <NotFound />
}
