import {
  useStatus,
  useUser,

  ERROR,
  FETCHING,
} from '../context/auth.js'

export default function UserGreeting () {
  const status = useStatus()
  const user = useUser()

  if (status === FETCHING) return <p>Loading...</p>
  if (status === ERROR) return <p>There was a problem signing in</p>

  if (user) return <p>Hi {user.name}!</p>

  return <p>You are not signed in.</p>
}
