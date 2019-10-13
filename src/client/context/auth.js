import {createContext, useCallback, useContext, useMemo, useState} from 'react'

import {useAsyncEffect} from './async.js'
import {useRouter} from '~/src/packula/router/react'

export const ANONYMOUS = 'anonymous'
export const AUTHENTICATED = 'authenticated'
export const ERROR = 'error'
export const FAILED = 'failed'
export const INIT = ''
export const SIGNING_IN = 'signing-in'

const AuthContext = createContext()

export function AuthProvider (props) {
  const {children} = props

  const router = useRouter()
  const signInEndpoint = router.buildUrl('api.v1.sign-in')
  const signOutEndpoint = router.buildUrl('api.v1.sign-out')
  const userEndpoint = router.buildUrl('api.v1.user')

  const [state, setState] = useState({status: INIT})

  useAsyncEffect(async () => {
    let user

    try {
      const response = await fetch(userEndpoint)
      user = await response.json()
    } catch (error) {}

    setState({
      status: user ? AUTHENTICATED : ANONYMOUS,
      user,
    })
  }, [])

  const signIn = useCallback(async data => {
    setState({status: SIGNING_IN})

    try {
      const response = await fetch(signInEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: data,
      })
      const user = await response.json()

      setState({
        status: user ? AUTHENTICATED : FAILED,
        user,
      })
    } catch (error) {
      setState({status: ERROR, error})
    }
  }, [setState, signInEndpoint])

  const signOut = useCallback(async () => {
    setState({status: ANONYMOUS})

    try {
      await fetch(signOutEndpoint, {method: 'POST'})
    } catch (error) {}
  }, [setState, signOutEndpoint])

  const context = useMemo(
    () => ({signIn, signOut, state}),
    [signIn, signOut, state],
  )

  return <AuthContext.Provider value={context}>
    {children}
  </AuthContext.Provider>
}

const useAuth = () => useContext(AuthContext)
const useAuthState = () => useAuth().state

export const useError = () => useAuthState().error
export const useSignIn = () => useAuth().signIn
export const useSignOut = () => useAuth().signOut
export const useStatus = () => useAuthState().status
export const useUser = () => useAuthState().user
