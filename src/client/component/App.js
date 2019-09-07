import {hot} from 'react-hot-loader/root'
import {RouterProvider} from 'react-router5'

import Root from './Root.js'
import {RouteDataProvider} from '../context/route-data.js'

export default hot(App)

function App (props) {
  const {routeData, router, subscribeToRouteData} = props

  return <RouterProvider router={router}>
    <RouteDataProvider routeData={routeData} subscribeToRouteData={subscribeToRouteData}>
      <Root />
    </RouteDataProvider>
  </RouterProvider>
}
