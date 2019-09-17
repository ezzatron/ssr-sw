import Main from './Main.js'
import Nav from './Nav.js'
import ServiceWorker from './ServiceWorker.js'
import UserStatus from './UserStatus.js'

export default function Root () {
  return <>
    <Nav />
    <UserStatus />
    <Main />
    <ServiceWorker />
  </>
}
