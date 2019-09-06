import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import routes from '../routes.js'
import {createAuthClient} from './auth-client.js'
import {createRouter, startRouter} from '../routing.js'

const router = createRouter(routes)
router.setDependencies({
  authClient: createAuthClient({router}),
})

if (readData('hydrate')) {
  Promise.all([
    startRouter(router, readData('routerState')),
    new Promise(resolve => { loadableReady(resolve) }),
  ])
    .then(() => {
      hydrate(
        <App router={router} />,
        document.getElementById('root'),
      )
    })
    .catch(error => {
      console.error(error)
    })
} else {
  Promise.all([
    startRouter(router),
    new Promise(resolve => {
      if (document.readyState !== 'loading') return resolve()

      document.addEventListener('DOMContentLoaded', resolve)
    }),
  ])
    .then(() => {
      render(
        <App router={router} />,
        document.getElementById('root'),
      )
    })
    .catch(error => {
      console.error(error)
    })
}

function readData (key) {
  const value = document.documentElement.dataset[key]

  if (value === '') return true

  return value ? JSON.parse(atob(value)) : undefined
}
