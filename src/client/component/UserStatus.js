import {
  useStatus,
  useUser,

  ERROR,
  FAILED,
  INIT,
  SIGNING_IN,
} from '~/src/client/context/auth.js'

export default function UserStatus () {
  const status = useStatus()
  const user = useUser()

  if (status === INIT) return <p>Loading...</p>
  if (status === SIGNING_IN) return <p>Signing in...</p>
  if (status === FAILED) return <p>Invalid credentials</p>
  if (status === ERROR) return <p>There was a problem signing in</p>

  if (user) return <p>Signed in as {user.name}</p>

  return <p>Not signed in</p>
}
