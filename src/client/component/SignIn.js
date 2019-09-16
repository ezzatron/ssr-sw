import SignInForm from './SignInForm.js'
import styles from './SignIn.module.css'

export default function SignIn () {
  return <div className={styles.signIn}>
    <h1>Sign in</h1>

    <p>Enter 111 or 222 for valid users</p>

    <SignInForm />
  </div>
}
