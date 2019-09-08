export default [
  {
    name: '',
    fetchData: ({authClient}) => ({
      user: authClient.fetchUser,
    }),
  },

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
  },
  {
    name: 'a.b',
    path: '/b',
    fetchData: (d, {data}) => ({
      b: () => data.a
        .then(a => sleep(100).then(() => a))
        .then(a => `${a}, b`),
    }),
  },
  {
    name: 'a.b.c',
    path: '/c',
    fetchData: (d, {data}) => ({
      c: () => data.b
        .then(b => sleep(100).then(() => b))
        .then(b => `${b}, c`),
    }),
  },
  {
    name: 'a.d',
    path: '/d',
    fetchData: (d, {data}) => ({
      d: () => data.a
        .then(a => sleep(1000).then(() => a))
        .then(a => `${a}, d`),
    }),
  },

  {name: 'client-only', path: '/client-only', isServer: false},
  {name: 'server-only', path: '/server-only', isClient: false},
  {name: 'server-error', path: '/server-error', isClient: false},
  {name: 'no-component', path: '/no-component'},

  {name: 'api', path: '/api', isClient: false},
  {name: 'api.v1', path: '/v1', isClient: false},
  {name: 'api.v1.user', path: '/user', isClient: false},
]

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
