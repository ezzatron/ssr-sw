import {createContext, useContext, useEffect, useState} from 'react'

const RouteDataContext = createContext()

export function RouteDataProvider (props) {
  const {
    children,
    routeDataFetcher: {getData, subscribeToData},
  } = props

  const [data, setData] = useState(getData())
  useEffect(() => subscribeToData(data => setData(data), data), [])

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = selector => selector(useContext(RouteDataContext))
