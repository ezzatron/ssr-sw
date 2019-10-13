import {useCallback, useRef} from 'react'

import styles from './SignOutLink.css'
import {useRouter} from '~/src/packula/router/react'

export default function SignOutLink () {
  const router = useRouter()
  const signOutAction = router.buildUrl('sign-out')

  const formEl = useRef(null)
  const handleClick = useCallback(event => {
    event.preventDefault()
    formEl.current.submit()
  }, formEl)

  return <form ref={formEl} action={signOutAction} method='post' className={styles.signOutLink}>
    <a href={signOutAction} onClick={handleClick}>Sign out</a>
  </form>
}
