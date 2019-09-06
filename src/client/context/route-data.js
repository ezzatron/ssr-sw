import transitionPath from 'router5-transition-path'
import {createContext, useContext, useEffect, useRef, useState} from 'react'
import {useRoute} from 'react-router5'

export const RouteDataContext = createContext()

export function RouteDataProvider (props) {
  const {children} = props

  const {route, previousRoute} = useRoute()
  const [data, setData] = useState({})
  const fetchCounter = useRef({})

  useEffect(
    () => {
      const {toDeactivate} = transitionPath(route, previousRoute)
      const toUnset = Object.keys(data).filter(key => toDeactivate.includes(data[key][0]))

      if (toUnset.length > 0) {
        setData(data => {
          return Object.fromEntries(
            Object.entries(data).filter(([key]) => !toUnset.includes(key)),
          )
        })
      }

      const counters = fetchCounter.current
      const {data: routeData} = route

      for (const segment in routeData) {
        counters[segment] = counters[segment] || 0
        const expectedCount = ++counters[segment]
        const fetcher = routeData[segment]

        for (const key in fetcher) {
          Promise.resolve(fetcher[key])
            .then(value => [segment, undefined, value], error => [segment, error])
            .then(result => {
              if (counters[segment] !== expectedCount) return

              setData(data => ({...data, [key]: result}))
            })
        }
      }
    },
    [route, previousRoute],
  )

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = () => useContext(RouteDataContext)
