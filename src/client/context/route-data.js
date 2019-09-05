import {createContext, useContext, useEffect, useState} from 'react'
import {useRoute} from 'react-router5'

export const RouteDataContext = createContext()

export function RouteDataProvider (props) {
  const {children} = props

  const {route: {data: routeData}} = useRoute()
  const [data, setData] = useState()

  useEffect(
    () => {
      const init = {}

      for (const segment in routeData) {
        for (const key in routeData[segment]) init[key] = undefined
      }

      setData(init)

      for (const segment in routeData) {
        const fetcher = routeData[segment]

        for (const key in fetcher) {
          Promise.resolve(fetcher[key])
            .then(value => [undefined, value], error => [error])
            .then(result => setData(data => ({...data, [key]: result})))
        }
      }
    },
    [routeData],
  )

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = () => useContext(RouteDataContext)
