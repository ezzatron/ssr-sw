import React from 'react'
import {hot} from 'react-hot-loader/root'
import {RouterProvider} from 'react-router5'

import Root from './Root.js'

export default hot(App)

function App (props) {
  const {router} = props

  return <RouterProvider router={router}>
    <Root />
  </RouterProvider>
}
