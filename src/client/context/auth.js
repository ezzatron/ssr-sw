import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useRouter} from 'react-router5'

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
  const signInEndpoint = router.buildPath('api.v1.sign-in')
  const signOutEndpoint = router.buildPath('api.v1.sign-out')
  const userEndpoint = router.buildPath('api.v1.user')

  const [state, setState] = useState({status: INIT})

  useEffect(() => {
    fetch(userEndpoint)
      .then(response => response.json())
      .then(user => {
        const status = user ? AUTHENTICATED : ANONYMOUS
        setState({status, user})
      })
      .catch(() => {})
  }, [])

  const signIn = useCallback(data => {
    setState({status: SIGNING_IN})

    fetch(signInEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data,
    })
      .then(response => response.json())
      .then(user => {
        const status = user ? AUTHENTICATED : FAILED
        setState({status, user})
      })
      .catch(error => {
        setState({status: ERROR, error})
      })
  }, [setState, signInEndpoint])

  const signOut = useCallback(() => {
    setState({status: ANONYMOUS})
    fetch(signOutEndpoint, {method: 'POST'}).catch(() => {})
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
