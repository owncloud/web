import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source'
import { ref, unref, watch } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { configurationManager } from '../../configuration'
import { useAccessToken } from '../authContext'
import { useStore } from '../store'

class FatalError extends Error {}

export interface ServerSentEventsOptions {
  url: string
  onOpen?: (response: Response) => void
  onMessage?: (msg: EventSourceMessage) => void
}

export const useServerSentEvents = (options: ServerSentEventsOptions) => {
  const store = useStore()
  const language = useGettext()
  const accessToken = useAccessToken({ store })
  const ctrl = ref(new AbortController())
  const maxRetries = 3
  const retryCounter = ref(0)

  watch(
    () => language.current,
    () => {
      unref(ctrl).abort()
    }
  )
  const setupServerSentEvents = () => {
    if (unref(retryCounter) >= maxRetries) {
      unref(ctrl).abort()
      throw new Error('Too many retries')
    }
    const setupSSE = async () => {
      retryCounter.value++
      try {
        ctrl.value = new AbortController()
        await fetchEventSource(new URL(options.url, configurationManager.serverUrl).href, {
          signal: unref(ctrl).signal,
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Accept-Language': unref(language).current,
            'X-Request-ID': uuidV4(),
            'X-Requested-With': 'XMLHttpRequest'
          },
          async onopen(response) {
            if (response.status === 401) {
              unref(ctrl).abort()
              throw TokenExp
              return
            } else if (response.status >= 500 || response.status === 404) {
              retryCounter.value = maxRetries
              throw new FatalError()
            } else {
              retryCounter.value = 0
              await options.onOpen?.(response)
            }
          },
          onerror(err) {
            if (err instanceof FatalError) {
              setTimeout(connect, 1m)
            }
          },
          onmessage(msg) {
            options.onMessage?.(msg)
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    setupSSE().then(() => {
      setupServerSentEvents()
    })
  }

  return setupServerSentEvents
}
