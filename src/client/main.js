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

const {routerState} = document.documentElement.dataset

if (routerState) {
  Promise.all([
    startRouter(router, JSON.parse(routerState)),
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
