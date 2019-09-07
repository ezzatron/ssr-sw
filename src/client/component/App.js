import {hot} from 'react-hot-loader/root'
import {RouterProvider} from 'react-router5'

import Root from './Root.js'
import {AuthProvider} from '../context/auth.js'
import {DataProvider} from '../context/data.js'

export default hot(App)

function App (props) {
  const {data, router, subscribeToData} = props

  return <RouterProvider router={router}>
    <DataProvider data={data} subscribeToData={subscribeToData}>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </DataProvider>
  </RouterProvider>
}
