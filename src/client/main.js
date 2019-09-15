import 'unfetch/polyfill'

import React from 'react'
import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

import App from './component/App.js'
import dataPlugin from '~/src/router5-plugin-data/client.js'
import routes from '~/src/routes.js'
import {createRouter, startRouter} from '~/src/routing.js'

async function main () {
  await renderApp()

  if ('serviceWorker' in navigator) {
    const {Workbox} = await import(/* webpackChunkName: 'workbox-window' */ 'workbox-window')

    const wb = new Workbox('/sw.js')
    wb.register()
  }
}

async function renderApp () {
  const appDataElement = document.getElementById('__APP_DATA__')
  const appData = appDataElement ? JSON.parse(appDataElement.innerText) : {}
  const {routeData, routerState, shouldHydrate} = appData

  const router = createRouter(routes, [
    dataPlugin(routes, routeData),
  ])
  router.setDependency('fetch', fetch)

  if (shouldHydrate) {
    await Promise.all([
      startRouter(router, routerState),
      new Promise(loadableReady),
    ])

    hydrate(
      <App router={router} />,
      document.getElementById('root'),
    )

    return
  }

  await Promise.all([
    startRouter(router, routerState),
    new Promise(resolve => {
      if (document.readyState !== 'loading') return resolve()

      document.addEventListener('DOMContentLoaded', resolve)
    }),
  ])

  const root = document.createElement('span')
  root.setAttribute('id', 'root')
  document.body.appendChild(root)

  render(
    <App router={router} />,
    root,
  )
}

main().catch(error => { console.error(error) })
