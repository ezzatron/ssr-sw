import {hot} from 'react-hot-loader/root'
import {RouterProvider} from 'react-router5'

import Root from './Root.js'
import {AuthProvider} from '../context/auth.js'

export default hot(App)

function App (props) {
  const {auth, router} = props

  return <RouterProvider router={router}>
    <AuthProvider state={auth}>
      <Root />
    </AuthProvider>
  </RouterProvider>
}
