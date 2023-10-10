import { SSEOptions } from './index'
import { EventSourcePolyfill } from 'event-source-polyfill'

export interface SSE {
  eventSource: EventSourcePolyfill
}

let eventSource: EventSourcePolyfill = null

export const sse = (baseURI: string, sseOptions: SSEOptions): SSE => {
  if (!eventSource) {
    eventSource = new EventSourcePolyfill(
      new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href,
      { ...sseOptions }
    )

    eventSource.onmessage = (event) => {
      console.log(event)
    }
  }

  return <SSE>{
    eventSource
  }
}
