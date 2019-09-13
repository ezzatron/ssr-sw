/* eslint-env worker */

import {createHandlerForURL, precacheAndRoute} from 'workbox-precaching'
import {NavigationRoute, registerRoute} from 'workbox-routing'

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

precacheAndRoute(self.__WB_MANIFEST)

const handler = createHandlerForURL(findAppShellUrl(self.__WB_MANIFEST))
const navigationRoute = new NavigationRoute(handler, {
  // whitelist: [],
  // blacklist: [],
})
registerRoute(navigationRoute)

function findAppShellUrl (manifest) {
  for (const {url} of manifest) {
    if (url.match(/^\/app-shell(\.hash~[^.]+)?\.html/)) return url
  }

  throw new Error('Unable to determine app shell URL')
}
