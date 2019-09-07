import {createContext, useContext, useEffect, useState} from 'react'

const DataContext = createContext()

export function DataProvider (props) {
  const {children, data: initialData, subscribeToData} = props
  const [data, setData] = useState(initialData)

  useEffect(() => {
    const [unsubscribe, currentData] = subscribeToData(setData)
    setData(currentData)

    return unsubscribe
  }, [])

  return <DataContext.Provider value={data}>
    {children}
  </DataContext.Provider>
}

export const useData = selector => selector(useContext(DataContext))
