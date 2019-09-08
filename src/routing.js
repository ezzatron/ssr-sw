import browserPlugin from 'router5-plugin-browser'
import {createRouter as createRouter5} from 'router5'

import redirectPlugin from './router5-plugin-redirect.js'
import universalPlugin from './router5-plugin-universal.js'

export function createRouter (routes, plugins = []) {
  const router = createRouter5(
    routes.filter(({name}) => name !== ''),
    {
      allowNotFound: true,
    },
  )

  router.usePlugin(redirectPlugin(routes))
  router.usePlugin(universalPlugin(routes))
  router.usePlugin(browserPlugin())
  for (const plugin of plugins) router.usePlugin(plugin)

  return router
}

export function startRouter (router, state) {
  return new Promise((resolve, reject) => {
    function handleStart (error, state) {
      if (!error) return resolve(state)

      const {promiseError} = error

      if (promiseError) return reject(promiseError)
      if (error instanceof Error) return reject(error)

      const realError = new Error('Unable to start router')
      realError.error = error

      reject(realError)
    }

    state ? router.start(state, handleStart) : router.start(handleStart)
  })
}
