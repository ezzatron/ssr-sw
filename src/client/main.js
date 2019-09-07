import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import routes from '../routes.js'
import {createAuthClient} from './auth-client.js'
import {createDataMiddleware, createRouter, startRouter} from '../routing.js'
import {createRouteDataFetcher} from './route-data.js'

const appDataElement = document.getElementById('__APP_DATA__')
const appData = appDataElement ? JSON.parse(appDataElement.innerText) : {}
const {routeData, routerState, shouldHydrate} = appData

const router = createRouter(routes)
router.setDependencies({
  authClient: createAuthClient({router}),
})

const routeDataFetcher = createRouteDataFetcher(routeData)
router.useMiddleware(createDataMiddleware({routeDataFetcher, routes}))

const props = {
  routeDataFetcher,
  router,
}

if (shouldHydrate) {
  Promise.all([
    startRouter(router, routerState),
    new Promise(resolve => {
      loadableReady(resolve)
    }),
  ])
    .then(() => {
      hydrate(
        <App {...props} />,
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
        <App {...props} />,
        document.getElementById('root'),
      )
    })
    .catch(error => {
      console.error(error)
    })
}
