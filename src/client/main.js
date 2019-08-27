import {hydrate} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import {createRouter, startRouter} from '../routing.js'

const router = createRouter()

Promise.all([
  startRouter(router, window.appState.router),
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
