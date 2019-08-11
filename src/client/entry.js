import {hydrate} from 'react-dom'

import App from './component/App.js'
import {createRouter} from '../routing.js'

const router = createRouter()

router.start(window.routerState, error => {
  if (error) console.error(error)

  const props = {
    router,
  }

  hydrate(App(props), document.getElementById('root'))
})
