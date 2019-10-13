import {createContext} from 'react'

const RouterContext = createContext()

export function RouterProvider (props) {
  const {children, router} = props

  return <RouterContext.Provider value={router}>
    {children}
  </RouterContext.Provider>
}
