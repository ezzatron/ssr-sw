import 'unfetch/polyfill'

import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import routes from '~/src/routes.js'
import {createMemoryRouter} from '~/src/packula/router/memory'

async function main () {
  const appDataElement = document.getElementById('__APP_DATA__')
  const appData = appDataElement ? JSON.parse(appDataElement.innerText) : {}
  const {routerState, shouldHydrate} = appData

  const router = createMemoryRouter(routes, routerState)
  const app = <App router={router} />

  if (shouldHydrate) {
    await new Promise(loadableReady)

    hydrate(app, document.getElementById('root'))

    return
  }

  await new Promise(resolve => {
    if (document.readyState !== 'loading') return resolve()

    document.addEventListener('DOMContentLoaded', resolve)
  })

  render(app, document.getElementById('root'))
}

main().catch(error => { console.error(error) })
