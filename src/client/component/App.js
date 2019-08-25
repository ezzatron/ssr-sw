import React from 'react'
import {RouterProvider} from 'react-router5'

import Root from './Root.js'

export default function App (props) {
  const {router} = props

  return <RouterProvider router={router}>
    <Root />
  </RouterProvider>
}
