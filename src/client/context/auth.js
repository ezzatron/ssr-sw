import {createContext, useContext, useMemo} from 'react'

import {useData} from './data.js'

const AuthContext = createContext()

export function AuthProvider (props) {
  const {children} = props

  const userData = useData(({user}) => user)

  const auth = useMemo(() => {
    if (!userData) return {status: ''}

    const [error, user] = userData

    if (error) return {status: 'error'}
    if (user) return {status: 'authenticated', user}

    return {status: 'anonymous'}
  }, [userData])

  return <AuthContext.Provider value={auth}>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
