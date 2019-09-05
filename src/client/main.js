import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import {createAuthClient} from './auth-client.js'
import {createRouter, startRouter} from '../routing.js'

const router = createRouter()
router.setDependencies({
  authClient: createAuthClient({router}),
})

const {appState} = window

if (appState) {
  const {router: routerState} = appState

  Promise.all([
    startRouter(router, routerState),
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
