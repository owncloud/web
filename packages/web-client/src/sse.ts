import { fetchEventSource } from '@microsoft/fetch-event-source'
import { FetchOptions } from './index'
export enum MESSAGE_TYPE {
  NOTIFICATION = 'notification',
  POSTPROCESSING = 'postprocessing'
}

export interface SSE {
  connect: () => void
  on: (messageType: MESSAGE_TYPE, callback: any) => void
}

const MAX_RETRIES = 3
class FatalError extends Error {}

export const sse = (baseURI: string, fetchOptions: FetchOptions): SSE => {
  const connected = false
  let retryCounter = 0
  const abortController = new AbortController()

  const connect = async () => {
    if (connected) {
      return
    }

    try {
      await fetchEventSource(
        new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href,
        {
          signal: abortController.signal,
          async onopen(response) {
            if (response.status === 401) {
              abortController.abort()
              return
            } else if (response.status >= 500 || response.status === 404) {
              retryCounter = MAX_RETRIES
              throw new FatalError()
            } else {
              retryCounter = 0
              await options.onOpen?.(response)
            }
          },
          onerror(err) {
            if (err instanceof FatalError) {
              throw err
            }
          },
          onmessage(msg) {
            options.onMessage?.(msg)
          },
          ...fetchOptions
        }
      )
    } catch (e) {
      console.error(e)
    }
  }

  connect()

  return <SSE>{
    on
  }
}
