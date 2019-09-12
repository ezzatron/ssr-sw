import {createContext, useContext, useEffect, useState} from 'react'
import {useRouter} from 'react-router5'

export {pending} from './util.js'

const RouteDataContext = createContext({})

export function RouteDataProvider (props) {
  const {children} = props

  const {getData, subscribeToData} = useRouter()
  const [data, setData] = useState(() => getData())

  useEffect(() => subscribeToData(setData, data).unsubscribe, [])

  return <RouteDataContext.Provider value={data}>
    {children}
  </RouteDataContext.Provider>
}

export const useRouteData = selector => selector(useContext(RouteDataContext))
