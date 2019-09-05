import {useRouter} from 'react-router5'

export default function SignOut () {
  const router = useRouter()
  const signOutAction = router.buildPath('sign-out')

  return <div>
    <h1>Sign out</h1>

    <form action={signOutAction} method='post'>
      <button type='sumbit'>Sign out</button>
    </form>
  </div>
}
