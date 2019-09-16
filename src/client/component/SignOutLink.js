import {useCallback, useRef} from 'react'
import {useRouter} from 'react-router5'

import styles from './SignOutLink.module.css'

export default function SignOutLink () {
  const router = useRouter()
  const signOutAction = router.buildPath('sign-out')

  const formEl = useRef(null)
  const handleClick = useCallback(event => {
    event.preventDefault()
    formEl.current.submit()
  }, formEl)

  return <form ref={formEl} action={signOutAction} method='post' className={styles.signOutLink}>
    <a href={signOutAction} onClick={handleClick}>Sign out</a>
  </form>
}
