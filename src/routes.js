import {persistent} from '~/src/router5-plugin-data/common.js'

let fetchCCount = 0
let fetchDCount = 0

export default [
  {name: 'home', path: '/', redirectTo: 'dashboard'},

  {name: 'dashboard', path: '/dashboard'},
  {name: 'sign-in', path: '/sign-in'},
  {name: 'sign-out', path: '/sign-out'},

  {
    name: 'a',
    path: '/a',
    fetchData: () => ({
      a: () => 'a',
    }),
    serverHeaders: {
      'X-Powered-By': 'Backula',
    },
  },
  {
    name: 'a.b',
    path: '/b',
    fetchData: (d, {data}) => ({
      b: () => data.a
        .then(a => sleep(100).then(() => a))
        .then(a => `${a}, b`),
    }),
    serverHeaders: {
      'X-Powered-By': 'Crackula',
    },
  },
  {
    name: 'a.b.c',
    path: '/c',
    fetchData: ({fetch}, {data}) => ({
      c: async ({signal}) => {
        await sleep(1000)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${++fetchCCount}`, {signal})
        const {name} = await response.json()

        return name
      },
    }),
    serverHeaders: {
      'X-Powered-By': 'Sackula',
    },
  },
  {
    name: 'a.d',
    path: '/d',
    cleanData: false,
    fetchData: (d, {data}) => ({
      d: persistent({onError: 'clean'}, () => data.a
        .then(a => {
          if (typeof window === 'object' && window.history && ++fetchDCount % 2) {
            return sleep(300).then(() => { throw new Error('Unable to get the D') })
          }

          return sleep(1000).then(() => a)
        })
        .then(a => `${a}, d`),
      ),
    }),
  },

  {name: 'client-only', path: '/client-only', isServer: false},
  {name: 'server-only', path: '/server-only', isClient: false},
  {name: 'server-error', path: '/server-error', isClient: false},
  {name: 'no-component', path: '/no-component'},

  {name: 'api', path: '/api', isClient: false},
  {name: 'api.v1', path: '/v1', isClient: false},
  {name: 'api.v1.sign-in', path: '/sign-in', isClient: false},
  {name: 'api.v1.sign-out', path: '/sign-out', isClient: false},
  {name: 'api.v1.user', path: '/user', isClient: false},
]

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
