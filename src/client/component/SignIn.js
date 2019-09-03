import {useRouter} from 'react-router5'

import styles from './SignIn.css'

export default function SignIn () {
  const router = useRouter()
  const signInAction = router.buildPath('api-sign-in')

  return <div className={styles.signIn}>
    <h1>Sign in</h1>

    <form action={signInAction} method='post'>
      <input type='hidden' name='userId' value='111' />
      <button type='sumbit'>Sign in as Amy</button>
    </form>

    <form action={signInAction} method='post'>
      <input type='hidden' name='userId' value='222' />
      <button type='sumbit'>Sign in as Bob</button>
    </form>
  </div>
}
