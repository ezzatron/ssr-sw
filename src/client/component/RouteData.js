import styles from './RouteData.css'
import {useRouteData} from '~/src/router5-plugin-data/react.js'

const errorClassName = `${styles.routeData} ${styles.error}`
const loadingClassName = `${styles.routeData} ${styles.loading}`
const successClassName = `${styles.routeData} ${styles.success}`

export default function RouteData (props) {
  const {name} = props
  const outcome = useRouteData(data => data[name])

  if (outcome) {
    const {reason, status, value} = outcome

    if (status === 'fulfilled') return <code className={successClassName}>{JSON.stringify(value, null, 2)}</code>
    if (status === 'rejected') return <code className={errorClassName}>ERROR: {reason.message}</code>
  }

  return <code className={loadingClassName}>Loading...</code>
}
