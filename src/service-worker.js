/* eslint-env worker */

import pathToRegexp from 'path-to-regexp'
import {createHandlerForURL, precacheAndRoute} from 'workbox-precaching'
import {NavigationRoute, registerRoute} from 'workbox-routing'

import routes from '~/src/routes.js'

const navigationWhitelist = routes
  .filter(({isClient = true}) => isClient)
  .map(({path}) => pathToRegexp(path))

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

precacheAndRoute(self.__WB_MANIFEST)

const handler = createHandlerForURL(findAppShellUrl(self.__WB_MANIFEST))
const navigationRoute = new NavigationRoute(handler, {
  whitelist: navigationWhitelist,
})
registerRoute(navigationRoute)

function findAppShellUrl (manifest) {
  for (const {url} of manifest) {
    if (url.match(/^\/app-shell(\.hash~[^.]+)?\.html/)) return url
  }

  throw new Error('Unable to determine app shell URL')
}
