import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source'
import { unref } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { configurationManager, useAccessToken, useStore } from 'web-pkg/src'
export * from './useServerSentEvents'

export interface ServerSentEventsOptions {
  url: string
  onOpen?: (response: Response) => void
  onMessage?: (msg: EventSourceMessage) => void
}

export const useServerSentEvents = (options: ServerSentEventsOptions) => {
  const store = useStore()
  const language = useGettext()
  const accessToken = useAccessToken({ store })
  const setupServerSentEvents = async () => {
    await fetchEventSource(`${configurationManager.serverUrl}${options.url}`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Accept-Language': unref(language).current,
        'X-Request-ID': uuidV4()
      },
      async onopen(response) {
        await options.onOpen?.(response)
      },
      onmessage(msg) {
        options.onMessage?.(msg)
      }
    })
  }

  return setupServerSentEvents
}
