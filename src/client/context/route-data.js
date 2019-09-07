import {createContext, useContext, useEffect, useState} from 'react'

const RouteDataContext = createContext()

export function RouteDataProvider (props) {
  const {children, routeData: initialData, subscribeToRouteData} = props
  const [data, setData] = useState(collapseSegments(initialData))

  useEffect(() => {
    const [unsubscribe, currentData] = subscribeToRouteData(data => setData(collapseSegments(data)))
    if (currentData !== initialData) setData(collapseSegments(currentData))

    return unsubscribe
  }, [])

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = selector => selector(useContext(RouteDataContext))

function collapseSegments (dataBySegment) {
  const data = {}
  for (const segment in dataBySegment) Object.assign(data, dataBySegment[segment])

  return data
}
