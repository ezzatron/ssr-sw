import {useSignOut, useUser} from '~/src/client/context/auth.js'

export default function SignOut () {
  const signOut = useSignOut()
  const user = useUser()

  return <div>
    <h1>Sign out</h1>

    {user && <button onClick={signOut}>Sign out</button>}
    {!user && <p>Not signed in</p>}
  </div>
}
