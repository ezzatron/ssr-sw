import styles from './RouteData.css'
import {useRouteData} from '~/src/router5-plugin-data/react.js'

const errorClassName = `${styles.routeData} ${styles.error}`
const loadingClassName = `${styles.routeData} ${styles.loading}`
const successClassName = `${styles.routeData} ${styles.success}`

export default function RouteData (props) {
  const {name} = props
  const data = useRouteData(data => data[name])

  if (!data) return <code className={loadingClassName}>Loading...</code>

  const [error, value] = data

  if (error) return <code className={errorClassName}>ERROR: {error.message}</code>

  return <code className={successClassName}>{value}</code>
}
