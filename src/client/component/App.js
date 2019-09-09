import {hot} from 'react-hot-loader/root'
import {RouterProvider} from 'react-router5'

import Root from './Root.js'
import {AuthProvider} from '~/src/client/context/auth.js'
import {RouteDataProvider} from '~/src/router5-plugin-data/react.js'

export default hot(App)

function App (props) {
  const {router} = props

  return <RouterProvider router={router}>
    <RouteDataProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </RouteDataProvider>
  </RouterProvider>
}
