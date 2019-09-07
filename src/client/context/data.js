import {createContext, useContext, useEffect, useState} from 'react'

const DataContext = createContext()

export function DataProvider (props) {
  const {children, data: initialData, subscribeToData} = props
  const [data, setData] = useState(collapseSegments(initialData))

  useEffect(() => {
    const [unsubscribe, currentData] = subscribeToData(data => setData(collapseSegments(data)))
    if (currentData !== initialData) setData(collapseSegments(currentData))

    return unsubscribe
  }, [])

  return <DataContext.Provider value={data}>
    {children}
  </DataContext.Provider>
}

export const useData = selector => selector(useContext(DataContext))

function collapseSegments (dataBySegment) {
  const data = {}
  for (const segment in dataBySegment) Object.assign(data, dataBySegment[segment])

  return data
}
