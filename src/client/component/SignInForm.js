import {useCallback} from 'react'

import {useSignIn} from '~/src/client/context/auth.js'

export default function SignInForm () {
  const signIn = useSignIn()

  const handleSubmit = useCallback(event => {
    event.preventDefault()

    signIn(formToObject(event.target))
  }, [signIn])

  return <form onSubmit={handleSubmit}>
    <input name='userId' defaultValue='111' placeholder='User ID' />

    <button type='sumbit'>Sign in</button>
  </form>
}

function formToObject (form) {
  return JSON.stringify(Object.fromEntries(new FormData(form).entries()))
}
