export default [
  {name: 'home', path: '/', redirectTo: 'dashboard'},

  {name: 'dashboard', path: '/dashboard'},
  {name: 'sign-in', path: '/sign-in'},
  {name: 'sign-out', path: '/sign-out'},

  {
    name: 'a',
    path: '/a',
    fetchData: ({fetch}) => ({
      a: randomPokemon(fetch),
    }),
    serverHeaders: {
      'X-Powered-By': 'Backula',
    },
  },
  {
    name: 'a.b',
    path: '/b',
    fetchData: ({fetch}, {data}) => ({
      b: async (...args) => {
        const a = await data.a
        const b = await randomPokemon(fetch)(...args)

        return `${a}, ${b}`
      },
    }),
    serverHeaders: {
      'X-Powered-By': 'Crackula',
    },
  },
  {
    name: 'a.b.c',
    path: '/c',
    fetchData: ({fetch}) => ({
      c: {
        // clean on deactivate unless fulfilled

        onActivate (clean, outcome) {
          if (outcome) return

          return randomPokemon(fetch)
        },

        onDeactivate (clean, {status}) {
          status !== 'fulfilled' && clean()
        },
      },
    }),
    serverHeaders: {
      'X-Powered-By': 'Sackula',
    },
  },
  {
    name: 'a.d',
    path: '/d',
    fetchData: ({fetch}) => ({
      d: {
        // clean on reactivate if rejected

        onActivate (clean, outcome) {
          if (outcome && outcome.status !== 'rejected') return

          return randomPokemon(fetch)
        },

        onDeactivate () {},
      },
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

function randomPokemon (fetch) {
  return async ({signal}) => {
    const number = Math.floor(Math.random() * 807) + 1

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`, {signal})
    const {name} = await response.json()

    return name
  }
}

// function sleep (ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }
