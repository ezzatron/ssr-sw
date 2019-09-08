import {createContext, useContext, useEffect, useState} from 'react'
import {useRouter} from 'react-router5'

const RouteDataContext = createContext()

export function RouteDataProvider (props) {
  const {children} = props

  const {getData, subscribeToData} = useRouter()
  const [data, setData] = useState(() => getData())

  useEffect(() => {
    const {unsubscribe} = subscribeToData(nextData => setData(nextData), data)

    return unsubscribe
  }, [])

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = selector => selector(useContext(RouteDataContext))
