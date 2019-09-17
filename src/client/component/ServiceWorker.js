import {useCallback, useRef, useState} from 'react'

import {useAsyncEffect} from '~/src/client/context/async.js'

export default function ServiceWorker () {
  const [isFirstActivate, setIsFirstActivate] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const wb = useRef()

  const handleReload = useCallback(() => {
    wb.current.addEventListener('controlling', () => {
      window.location.reload()
    })

    wb.current.messageSW({type: 'SKIP_WAITING'})
  }, [wb])

  useAsyncEffect(async () => {
    if ('serviceWorker' in navigator) {
      const {Workbox} = await import(/* webpackChunkName: 'workbox-window' */ 'workbox-window')

      wb.current = new Workbox('/sw.js')

      wb.current.addEventListener('activated', event => {
        setIsFirstActivate(!event.isUpdate)
      })

      wb.current.addEventListener('waiting', () => {
        setIsWaiting(true)
      })

      setInterval(() => {
        wb.current.update()
      }, 1000 * 60 * 5)

      wb.current.register()
    }
  }, [])

  return <>
    {isFirstActivate && <span>Offline ready</span>}
    {isWaiting && <span>
      Update available <button onClick={handleReload}>Reload</button>
    </span>}
  </>
}
