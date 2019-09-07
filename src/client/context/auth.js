import {useMemo} from 'react'

import {useRouteData} from './route-data.js'

export const FETCHING = ''
export const ERROR = 'error'
export const AUTHENTICATED = 'authenticated'
export const ANONYMOUS = 'anonymous'

export function useStatus () {
  const data = useRouteData(({user}) => user)

  return useMemo(() => {
    if (!data) return FETCHING

    const [error, user] = data

    if (error) return ERROR
    if (user) return AUTHENTICATED

    return ANONYMOUS
  }, [data])
}

export function useUser () {
  const data = useRouteData(({user}) => user)

  return useMemo(() => {
    if (!data) return undefined

    const [error, user] = data

    if (!error && user) return user

    return undefined
  }, [data])
}
