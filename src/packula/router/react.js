import {createContext, useContext, useEffect, useState} from 'react'

import {ROOT} from '~/src/packula/router/symbols'

const RouterContext = createContext()

export function RouterProvider (props) {
  const {children, router} = props

  return <RouterContext.Provider value={router}>
    {children}
  </RouterContext.Provider>
}

export function useRouteNode (name = ROOT) {
  const router = useRouter()

  const [state, setState] = useState(() => {
    const {current} = router.getState()
    const active = getChildNode(router, name, current.name)

    return active ? {name: active, params: current.params} : {}
  })

  useEffect(() => router.subscribe(next => {
    const active = getChildNode(router, name, next.name)
    const nextState = active ? {name: active, params: next.params} : {}

    if (nextState.name !== state.name || nextState.params !== state.params) setState(nextState)
  }), [router])

  return state
}

export function useRouter () {
  return useContext(RouterContext)
}

function getChildNode (router, ancestor, descendant) {
  const ancestorNodes = router.routeNodes(ancestor)
  const descendantNodes = router.routeNodes(descendant)

  if (descendantNodes.length <= ancestorNodes.length) return undefined
  if (ancestorNodes.some((node, i) => descendantNodes[i] !== node)) return undefined

  return descendantNodes[ancestorNodes.length]
}
