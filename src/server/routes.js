import routes from '../routes.js'

export default {
  ...routes,

  a: {
    ...routes.a,

    serverHeaders: {
      'X-Powered-By': 'Backula',
    },
  },

  b: {
    ...routes.b,

    serverHeaders: {
      'X-Powered-By': 'Crackula',
    },
  },

  c: {
    ...routes.c,

    serverHeaders: {
      'X-Powered-By': 'Sackula',
    },
  },
}
