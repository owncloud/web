import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source'
import { useAccessToken, useStore } from 'web-pkg/src'
export * from './useServerSentEvents'

export interface ServerSentEventsOptions {
  url: string
  onOpen?: (response: Response) => void
  onMessage?: (msg: EventSourceMessage) => void
}

export const useServerSentEvents = (options: ServerSentEventsOptions) => {
  const store = useStore()
  const accessToken = useAccessToken({ store })

  const setupServerSentEvents = async () => {
    await fetchEventSource(options.url, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
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
