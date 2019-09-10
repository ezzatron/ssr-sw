import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import dataPlugin from '~/src/router5-plugin-data/client.js'
import routes from '~/src/routes.js'
import {createRouter, startRouter} from '~/src/routing.js'

const appDataElement = document.getElementById('__APP_DATA__')
const appData = appDataElement ? JSON.parse(appDataElement.innerText) : {}
const {routeData, routerState, shouldHydrate} = appData

const router = createRouter(routes, [
  dataPlugin(routes, routeData),
])

if (shouldHydrate) {
  Promise.all([
    startRouter(router, routerState),
    new Promise(resolve => {
      loadableReady(resolve)
    }),
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
    startRouter(router, routerState),
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
