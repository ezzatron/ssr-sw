import {useAuth} from '../context/auth.js'

export default function UserGreeting () {
  const {user} = useAuth()

  if (user) return <p>Hi {user.name}!</p>

  return <p>You are not signed in.</p>
}
