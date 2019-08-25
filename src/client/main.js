import React from 'react'
import {AppContainer} from 'react-hot-loader'
import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import {createRouter, startRouter} from '../routing.js'

const router = createRouter()

function createApp () {
  return <AppContainer>
    <App router={router} />
  </AppContainer>
}

Promise.all([
  startRouter(router, window.appState.router),
  new Promise(resolve => { loadableReady(resolve) }),
])
  .then(() => {
    hydrate(createApp(), document.getElementById('root'))
  })
  .catch(error => {
    console.error(error)
  })

if (module.hot) {
  module.hot.accept('./component/App.js', () => {
    render(createApp(), document.getElementById('root'))
  })
}
