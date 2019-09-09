import {Link} from 'react-router5'
import {useCallback} from 'react'

import {useSignOut, useUser} from '~/src/client/context/auth.js'

export default function AuthLink () {
  const user = useUser()
  const signOut = useSignOut()

  const handleSignOut = useCallback(event => {
    event.preventDefault()

    signOut()
  }, [signOut])

  if (!user) return <Link routeName='sign-in'>Sign in</Link>

  return <Link routeName='sign-out' onClick={handleSignOut}>Sign out</Link>
}
