import {useEffect} from 'react'

export function useAsyncEffect (fn, deps) {
  return useEffect(() => {
    fn().catch(error => { console.error(error) })
  }, deps)
}
