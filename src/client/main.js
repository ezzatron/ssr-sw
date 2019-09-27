import 'unfetch/polyfill'

import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import routes from '~/src/routes.js'
import {createRouter} from '~/src/packula/router'

async function main () {
  const appDataElement = document.getElementById('__APP_DATA__')
  const appData = appDataElement ? JSON.parse(appDataElement.innerText) : {}
  const {routerState, shouldHydrate} = appData

  const router = createRouter(routes)
  const appProps = {router, routerState}
  const app = <App {...appProps} />

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
