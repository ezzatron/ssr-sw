import {useRouteData} from '~/src/router5-plugin-data/react.js'

export const FETCHING = ''
export const ERROR = 'error'
export const AUTHENTICATED = 'authenticated'
export const ANONYMOUS = 'anonymous'

export function useStatus () {
  const data = useRouteData(({user}) => user)

  if (!data) return FETCHING

  const [error, user] = data

  if (error) return ERROR
  if (user) return AUTHENTICATED

  return ANONYMOUS
}

export function useUser () {
  const data = useRouteData(({user}) => user)

  if (!data) return undefined

  const [error, user] = data

  if (!error && user) return user

  return undefined
}
