import {flattenRoutes} from '~/src/packula/router/config'
import {persistentRoute} from '~/src/router5-plugin-data/index.js'
import {ROOT} from '~/src/packula/router/symbols'

const fetchCounts = {
  c: 0,
  d: 0,
}

export default flattenRoutes({
  [ROOT]: {
    options: {
      csr: true,
      ssr: true,
    },
  },

  home: {
    path: '',
    options: {
      redirect: 'dashboard',
    },
  },

  dashboard: {
    path: 'dashboard',
  },

  signIn: {
    path: 'sign-in',
  },

  signOut: {
    path: 'sign-out',
  },

  clientOnly: {
    path: 'client-only',
    options: {
      ssr: false,
    },
  },

  serverOnly: {
    path: 'server-only',
    options: {
      csr: false,
    },
  },

  serverError: {
    path: 'server-error',
    options: {
      csr: false,
    },
  },

  noComponent: {
    path: 'no-component',
  },

  api: {
    path: 'api/v1',
    options: {
      csr: false,
    },

    children: {
      apiSignIn: {
        path: 'sign-in',
      },

      apiSignOut: {
        path: 'sign-out',
      },

      apiSlow: {
        path: 'slow',
      },

      apiUser: {
        path: 'user',
      },
    },
  },

  a: {
    path: 'a',

    fetchData: ({fetch}) => ({
      a: randomPokemon(fetch),
    }),

    children: {
      b: {
        path: 'b',

        fetchData: ({fetch}, {data}) => ({
          b: async (...args) => {
            const a = await data.a
            const b = await randomPokemon(fetch)(...args)

            return `${a}, ${b}`
          },
        }),

        children: {
          c: {
            path: 'c',

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

              slowC: {
                // clean on deactivate unless fulfilled

                onActivate (clean, outcome) {
                  if (typeof window !== 'object') return () => ({})
                  if (outcome) return

                  return async ({signal}) => {
                    if (typeof window !== 'object') return ++fetchCounts.c

                    const response = await fetch(
                      '/api/v1/slow',
                      {
                        signal,
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({echo: ++fetchCounts.c}),
                      },
                    )
                    const {echo} = await response.json()

                    if (echo % 2 !== 0) throw new Error('You done goofed.')

                    return echo
                  }
                },

                onDeactivate (clean, {status}) {
                  status !== 'fulfilled' && clean()
                },
              },
            }),
          },
        },
      },

      d: {
        path: 'd',

        fetchData: persistentRoute(({fetch}) => ({
          d: randomPokemon(fetch),

          slowD: async ({signal}) => {
            if (typeof window !== 'object') return ++fetchCounts.d

            const response = await fetch(
              '/api/v1/slow',
              {
                signal,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({echo: ++fetchCounts.d}),
              },
            )
            const {echo} = await response.json()

            if (echo % 2 !== 0) throw new Error('You done goofed.')

            return echo
          },
        })),
      },
    },
  },
})

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
