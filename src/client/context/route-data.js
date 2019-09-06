import transitionPath from 'router5-transition-path'
import {createContext, useContext, useEffect, useRef, useState} from 'react'
import {useRouter} from 'react-router5'

export const RouteDataContext = createContext()

export function RouteDataProvider (props) {
  const {children} = props

  const router = useRouter()
  const [data, setData] = useState({})
  const fetchCounter = useRef({})

  useEffect(
    () => {
      activate(router.getState())

      return router.subscribe(({route, previousRoute}) => {
        deactivate(route, previousRoute)
        activate(route)
      })

      function activate (route) {
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
      }

      function deactivate (route, previousRoute) {
        const {toDeactivate} = transitionPath(route, previousRoute)
        const toUnset = Object.keys(data).filter(key => toDeactivate.includes(data[key][0]))

        console.log({toUnset})

        if (toUnset.length > 0) {
          setData(data => {
            return Object.fromEntries(
              Object.entries(data).filter(([key]) => !toUnset.includes(key)),
            )
          })
        }
      }
    },
    [router],
  )

  console.log('Rendered', data)

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = () => useContext(RouteDataContext)
