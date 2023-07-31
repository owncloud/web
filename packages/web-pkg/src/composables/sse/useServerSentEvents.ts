import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source'
import { ref, unref } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { configurationManager, useAccessToken, useStore } from 'web-pkg/src'

export interface ServerSentEventsOptions {
  url: string
  onOpen?: (response: Response) => void
  onMessage?: (msg: EventSourceMessage) => void
}

export const useServerSentEvents = (options: ServerSentEventsOptions) => {
  const store = useStore()
  const language = useGettext()
  const accessToken = useAccessToken({ store })
  const ctrl = new AbortController()
  const retryCounter = ref(0)
  const setupServerSentEvents = () => {
    if (unref(retryCounter) >= 5) {
      ctrl.abort()
      throw new Error('Too many retries')
    }
    const setupSSE = async () => {
      retryCounter.value++
      await fetchEventSource(new URL(options.url, configurationManager.serverUrl).href, {
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'Accept-Language': unref(language).current,
          'X-Request-ID': uuidV4()
        },
        async onopen(response) {
          if (response.status === 401) {
            ctrl.abort()
            return
          }
          retryCounter.value = 0
          await options.onOpen?.(response)
        },
        onmessage(msg) {
          options.onMessage?.(msg)
        }
      })
    }
    setupSSE().then(() => {
      setupServerSentEvents()
    })
  }

  return setupServerSentEvents
}
