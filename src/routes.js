import {redirect} from './routing.js'

export default [
  {
    name: '',
    fetchData: (_, {authClient}) => ({
      user: authClient.fetchUser(),
    }),
  },

  {name: 'home', path: '/', canActivate: redirect('dashboard')},

  {name: 'dashboard', path: '/dashboard'},
  {name: 'sign-in', path: '/sign-in'},
  {name: 'sign-out', path: '/sign-out'},

  {
    name: 'a',
    path: '/a',
    fetchData: () => ({
      a: Promise.resolve('a'),
    }),
  },
  {
    name: 'a.b',
    path: '/b',
    fetchData: () => ({
      b: Promise.resolve('b'),
    }),
  },
  {
    name: 'a.b.c',
    path: '/c',
    fetchData: () => ({
      c: Promise.resolve('c'),
    }),
  },

  {name: 'universal', path: '/universal'},
  {name: 'client-only', path: '/client-only', isServer: false},
  {name: 'server-only', path: '/server-only', isClient: false},
  {name: 'no-component', path: '/no-component'},

  {name: 'api-user', path: '/api/v1/user', isClient: false},
]