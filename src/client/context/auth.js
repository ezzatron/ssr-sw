import {createContext, useContext, useMemo, useState} from 'react'
import {useRouter} from 'react-router5'

const init = {
  status: '',
  user: null,
}

export const AuthContext = createContext()

export function AuthProvider (props) {
  const {children, state = init} = props

  const [auth, setAuth] = useState(state)
  const value = useMemo(() => [auth, setAuth], [auth, setAuth])

  if (!auth.status) {
    const router = useRouter()
    const userUrl = router.buildPath('api-user')

    fetch(userUrl)
      .then(response => response.json())
      .then(user => {
        if (!user) return setAuth({status: 'anonymous', user: null})

        setAuth({status: 'authenticated', user})
      })
  }

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
