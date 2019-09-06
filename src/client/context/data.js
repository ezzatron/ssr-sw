import {createContext, useContext, useEffect, useState} from 'react'

export const DataContext = createContext()

export function DataProvider (props) {
  const {children, data: initialData, subscribeToData} = props
  const [data, setData] = useState(initialData)

  useEffect(() => {
    const [unsubscribe, currentData] = subscribeToData(setData)
    setData(currentData)

    return unsubscribe
  }, [])

  console.log('Rendered', data)

  return <DataContext.Provider value={data}>
    {children}
  </DataContext.Provider>
}

export const useData = () => useContext(DataContext)
