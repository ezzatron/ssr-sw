import {useMemo} from 'react'

import {useData} from './data.js'

export const FETCHING = ''
export const ERROR = 'error'
export const AUTHENTICATED = 'authenticated'
export const ANONYMOUS = 'anonymous'

export function useStatus () {
  const data = useData(({user}) => user)

  return useMemo(() => {
    if (!data) return FETCHING

    const [error, user] = data

    if (error) return ERROR
    if (user) return AUTHENTICATED

    return ANONYMOUS
  }, [data])
}

export function useUser () {
  const data = useData(({user}) => user)

  return useMemo(() => {
    if (!data) return undefined

    const [error, user] = data

    if (!error && user) return user

    return undefined
  }, [data])
}
