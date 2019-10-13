import {hot} from 'react-hot-loader/root'

import Root from './Root.js'
import {RouterProvider} from '~/src/packula/router/react'

export default hot(App)

function App (props) {
  const {router} = props

  return <RouterProvider router={router}>
    <Root />
  </RouterProvider>
}
